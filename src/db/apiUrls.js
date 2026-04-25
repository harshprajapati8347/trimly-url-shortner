import supabase, {supabaseUrl} from "./supabase";

export async function getUrls(user_id) {
  if (user_id === "guest") {
    const localUrls = localStorage.getItem("guest_urls");
    return localUrls ? JSON.parse(localUrls) : [];
  }

  let {data, error} = await supabase
    .from("urls")
    .select("*")
    .eq("user_id", user_id);

  if (error) {
    console.error(error);
    throw new Error("Unable to load URLs");
  }

  return data;
}

export async function getUrl({id, user_id}) {
  if (user_id === "guest") {
    const localUrls = JSON.parse(localStorage.getItem("guest_urls") || "[]");
    const url = localUrls.find((u) => String(u.id) === String(id));
    if (!url) throw new Error("Short Url not found");
    return url;
  }

  const {data, error} = await supabase
    .from("urls")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Short Url not found");
  }

  return data;
}

export async function getLongUrl(id) {
  let {data: shortLinkData, error: shortLinkError} = await supabase
    .from("urls")
    .select("id, original_url")
    .or(`short_url.eq.${id},custom_url.eq.${id}`)
    .single();

  if (shortLinkError && shortLinkError.code !== "PGRST116") {
    console.error("Error fetching short link:", shortLinkError);
    return;
  }

  // Fallback to guest links if not found in db
  if (!shortLinkData) {
    const localUrls = JSON.parse(localStorage.getItem("guest_urls") || "[]");
    const url = localUrls.find((u) => u.short_url === id || u.custom_url === id);
    if (!url) return null;
    return { id: url.id, original_url: url.original_url };
  }

  return shortLinkData;
}

export async function createUrl({title, longUrl, customUrl, user_id}, qrcode) {
  const short_url = Math.random().toString(36).substr(2, 6);
  const fileName = `qr-${short_url}`;

  let qr = "";
  if (user_id === "guest") {
    // Cannot upload to supabase storage for guests without RLS issues easily,
    // so we mock the QR URL by generating it locally via a data URL later or using an external generator for placeholder.
    qr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(import.meta.env.VITE_APP_URL_DOMAIN || window.location.origin + "/" + short_url)}`;
  } else {
    const {error: storageError} = await supabase.storage
      .from("qrs")
      .upload(fileName, qrcode);

    if (storageError) throw new Error(storageError.message);

    qr = `${supabaseUrl}/storage/v1/object/public/qrs/${fileName}`;
  }

  const newUrl = {
    title,
    user_id: user_id === "guest" ? null : user_id, 
    original_url: longUrl,
    custom_url: customUrl || null,
    short_url,
    qr,
    created_at: new Date().toISOString()
  };

  if (user_id === "guest") {
    const localUrls = JSON.parse(localStorage.getItem("guest_urls") || "[]");
    if (localUrls.length >= 5) {
      throw new Error("Guest users can only create up to 5 links. Please create an account to do more.");
    }
    const mockData = { ...newUrl, id: Math.random().toString(36).substr(2, 9) };
    localStorage.setItem("guest_urls", JSON.stringify([mockData, ...localUrls]));
    return [mockData];
  }

  const {data, error} = await supabase
    .from("urls")
    .insert([newUrl])
    .select();

  if (error) {
    console.error(error.message);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteUrl(id) {
  // First attempt to delete from localStorage just in case it's a guest link
  const localUrls = JSON.parse(localStorage.getItem("guest_urls") || "[]");
  const filteredUrls = localUrls.filter((u) => String(u.id) !== String(id));
  if (localUrls.length !== filteredUrls.length) {
    localStorage.setItem("guest_urls", JSON.stringify(filteredUrls));
    return [];
  }

  const {data, error} = await supabase.from("urls").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error("Unable to delete Url");
  }

  return data;
}
