import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "~/providers/auth-provider";
import {useEffect} from "react";
import {useNavigate} from "react-router";

type SignInFormData = {
  email: string;
  password: string;
};

const signInSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự")
});

export default function SignIn() {
  const { signIn, isSigningIn, auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if(auth.user) {
      navigate("/");
    }
  }, [auth.user]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema)
  });

  return (
    <div className="h-screen flex flex-col justify-center items-center space-y-4">
      <h1 className="font-bold text-xl">Đăng nhập</h1>
      <form
        onSubmit={
          handleSubmit((data: SignInFormData) => signIn(data))
        }
      >
        <div className="space-y-3 w-[250px]">
          <div>
            <label
              className="mb-3 block font-medium text-black text-sm"
              htmlFor="name"
            >
              Email
            </label>
            <input
              {...register("email")}
              className="block h-12 w-full rounded-lg bg-white px-4 py-2 text-sm border"
              id="name"
              placeholder="Nhập email..."
              type="text"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">
                {errors.email.message as string}
              </p>
            )}
          </div>
          <div className="col-span-full">
            <label
              className="mb-3 block font-medium text-black text-sm"
              htmlFor="password"
            >
              Mật khẩu
            </label>
            <input
              {...register("password")}
              className="block h-12 w-full rounded-lg bg-white px-4 py-2 text-sm border"
              id="password"
              placeholder="Nhập mật khẩu..."
              type="password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">
                {errors.password.message as string}
              </p>
            )}
          </div>
          <div className="col-span-full">
            <button
              className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-neutral-900 px-5 py-3 font-medium text-white duration-200 hover:bg-neutral-700 focus:ring-2 focus:ring-black focus:ring-offset-2"
              type="submit"
              disabled={isSigningIn}
            >
              {isSigningIn ? "Đang xử lý..." : "Đăng nhập"}
            </button>
            {auth.message && (
              <p
                className={`mt-3 text-sm ${auth.message.includes("thành công") ? "text-green-600" : "text-red-600"}`}
              >
                {auth.message}
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
