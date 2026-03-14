import {Input} from "./ui/input";
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
import {useEffect, useState} from "react";
import * as Yup from "yup";
import Error from "./error";
import {login} from "@/db/apiAuth";
import {BeatLoader} from "react-spinners";
import useFetch from "@/hooks/use-fetch";
import {UrlState} from "@/context";
import {toast} from "sonner";

const Login = () => {
  let [searchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const {loading, error, fn: fnLogin, data} = useFetch(login, formData);
  const {fetchUser} = UrlState();

  useEffect(() => {
    if (error === null && data) {
      toast.success("Successfully logged in!");
      fetchUser();
      navigate(`/dashboard?${longLink ? `createNew=${longLink}` : ""}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, data]);

  const handleLogin = async () => {
    setErrors([]);
    try {
      const schema = Yup.object().shape({
        email: Yup.string()
          .email("Invalid email")
          .required("Email is required"),
        password: Yup.string()
          .min(6, "Password must be at least 6 characters")
          .required("Password is required"),
      });

      await schema.validate(formData, {abortEarly: false});
      await fnLogin();
    } catch (e) {
      const newErrors = {};

      e?.inner?.forEach((err) => {
        newErrors[err.path] = err.message;
      });

      setErrors(newErrors);
    }
  };

  return (
    <Card className="border-border shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Welcome back! Access your customized shortened links.
        </CardDescription>
        {error && <Error message={error.message} />}
      </CardHeader>
      <CardContent className="space-y-4">
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
            placeholder="Password"
            className="w-full"
            onChange={handleInputChange}
          />
          {errors.password && <Error message={errors.password} />}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleLogin} className="w-full" size="lg" disabled={loading}>
          {loading ? <BeatLoader size={10} color="white" /> : "Login"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Login;
