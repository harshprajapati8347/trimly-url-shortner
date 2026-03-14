import {UAParser} from "ua-parser-js";
import supabase from "./supabase";

// export async function getClicks() {
//   let {data, error} = await supabase.from("clicks").select("*");

//   if (error) {
//     console.error(error);
//     throw new Error("Unable to load Stats");
//   }

//   return data;
// }

export async function getClicksForUrls(urlIds) {
  if (!urlIds || urlIds.length === 0) return [];
  
  // Filter out guest IDs (non-uuids like short strings we generate for guests)
  const validIds = urlIds.filter(id => !id.includes("-") === false || id.length > 20); // rough UUID check
  const guestIds = urlIds.filter(id => id.includes("-") === false && id.length < 20);
  
  let validData = [];
  if (validIds.length > 0) {
    const {data, error} = await supabase
      .from("clicks")
      .select("*")
      .in("url_id", validIds);

    if (error) {
      console.error("Error fetching clicks:", error);
    } else {
      validData = data;
    }
  }

  const localClicks = JSON.parse(localStorage.getItem("guest_clicks") || "[]");
  const guestData = localClicks.filter(c => guestIds.includes(c.url_id));

  return [...validData, ...guestData];
}

export async function getClicksForUrl(url_id) {
  // Check if it's a guest ID
  if (url_id && url_id.length < 20) {
    const localClicks = JSON.parse(localStorage.getItem("guest_clicks") || "[]");
    return localClicks.filter(c => String(c.url_id) === String(url_id));
  }

  const {data, error} = await supabase
    .from("clicks")
    .select("*")
    .eq("url_id", url_id);

  if (error) {
    console.error(error);
    throw new Error("Unable to load Stats");
  }

  return data;
}

const parser = new UAParser();

export const storeClicks = async ({id, originalUrl}) => {
  try {
    const res = parser.getResult();
    const device = res.type || "desktop"; // Default to desktop if type is not detected

    const response = await fetch("https://ipapi.co/json");
    const {city, country_name: country} = await response.json();

    const isGuestId = id && id.length < 20;

    if (isGuestId) {
      const localClicks = JSON.parse(localStorage.getItem("guest_clicks") || "[]");
      const newClick = {
        id: Math.random().toString(36).substr(2, 9),
        url_id: id,
        city: city || "Unknown",
        country: country || "Unknown",
        device: device,
        created_at: new Date().toISOString()
      };
      localStorage.setItem("guest_clicks", JSON.stringify([newClick, ...localClicks]));
    } else {
      // Record the click
      await supabase.from("clicks").insert({
        url_id: id,
        city: city,
        country: country,
        device: device,
      });
    }

    // Redirect to the original URL
    window.location.href = originalUrl;
  } catch (error) {
    console.error("Error recording click:", error);
    // Even if tracking fails, redirect the user
    window.location.href = originalUrl;
  }
};
