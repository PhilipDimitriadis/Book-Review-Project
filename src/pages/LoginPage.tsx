import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type LoginFields, loginSchema } from "../api/login.ts";
import { Input } from "../components/ui/input.tsx";
import { Button } from "../components/ui/button.tsx";
import { Label } from "../components/ui/label.tsx";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { useNavigate } from "react-router";

export default function LoginPage() {
    const { loginUser } = useAuth();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFields>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFields) => {
        try {
            await loginUser(data);
            toast.success("Login successfully");
            navigate("/products");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Login failed");
        }
    };

    return (
        <>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="max-w-sm mx-auto p-8 space-y-4 border rounded"
            >
                <h1 className="flex justify-center text-3xl font-bold text-center mb-2 text-gray-800">Welcome Back!</h1>
                <div>
                    <Label htmlFor="username" className="mb-1"></Label>
                    <Input
                        id="username"
                        placeholder="Username"
                        autoFocus
                        {...register("username")}
                        disabled={isSubmitting}
                    />
                    {errors.username && (
                        <div className="text-cf-dark-red">{errors.username.message}</div>
                    )}
                </div>

                <div>
                    <Label htmlFor="password" className="mb-1"></Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Password"
                        autoFocus
                        {...register("password")}
                        disabled={isSubmitting}
                    />
                    {errors.password && (
                        <div className="text-cf-dark-red">{errors.password.message}</div>
                    )}
                </div>

                <div className="flex justify-center">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Logging ..." : "Login"}
                    </Button>
                </div>
            </form>
        </>
    );
}
