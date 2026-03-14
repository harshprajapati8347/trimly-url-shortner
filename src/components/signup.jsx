import {useEffect, useState} from "react";
import Error from "./error";
import {Input} from "./ui/input";
import * as Yup from "yup";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {Button} from "./ui/button";
import {useNavigate, useSearchParams} from "react-router-dom";
import {signup} from "@/db/apiAuth";
import {BeatLoader} from "react-spinners";
import useFetch from "@/hooks/use-fetch";
import {toast} from "sonner";

const Signup = () => {
  let [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profile_pic: null,
  });

  const handleInputChange = (e) => {
    const {name, value, files} = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: files ? files[0] : value,
    }));
  };

  const {loading, error, fn: fnSignup, data} = useFetch(signup, formData);

  useEffect(() => {
    if (error === null && data) {
      toast.success("Account created successfully!");
      navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, loading]);

  const handleSignup = async () => {
    setErrors([]);
    try {
      const schema = Yup.object().shape({
        name: Yup.string().required("Name is required"),
        email: Yup.string()
          .email("Invalid email")
          .required("Email is required"),
        password: Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
        profile_pic: Yup.mixed().required("Profile picture is required"),
      });

      await schema.validate(formData, {abortEarly: false});
      await fnSignup();
    } catch (error) {
      const newErrors = {};
      if (error?.inner) {
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });

        setErrors(newErrors);
      } else {
        setErrors({api: error.message});
      }
    }
  };

  return (
    <Card className="border-border shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Signup</CardTitle>
        <CardDescription>
          Create a free account to manage your URLs
        </CardDescription>
        {error && <Error message={error?.message} />}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            name="name"
            type="text"
            placeholder="Full Name"
            className="w-full"
            onChange={handleInputChange}
          />
          {errors.name && <Error message={errors.name} />}
        </div>
        
        <div className="space-y-2">
          <Input
            name="email"
            type="email"
            placeholder="Email Address"
            className="w-full"
            onChange={handleInputChange}
          />
          {errors.email && <Error message={errors.email} />}
        </div>
        
        <div className="space-y-2">
          <Input
            name="password"
            type="password"
            placeholder="Password (min 6 chars)"
            className="w-full"
            onChange={handleInputChange}
          />
          {errors.password && <Error message={errors.password} />}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground font-medium mb-1 block">Profile Picture</label>
          <Input
            name="profile_pic"
            type="file"
            accept="image/*"
            className="w-full file:bg-muted file:text-foreground file:border-0 hover:file:bg-accent hover:file:text-accent-foreground"
            onChange={handleInputChange}
          />
          {errors.profile_pic && <Error message={errors.profile_pic} />}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSignup} className="w-full" size="lg" disabled={loading}>
          {loading ? (
            <BeatLoader size={10} color="white" />
          ) : (
            "Create Account"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Signup;
