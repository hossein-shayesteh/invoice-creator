import { handleSignIn } from "@/lib/auth-services";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SignInPage = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* 1. Set the direction and default text alignment for the entire card */}
        <Card className="text-right" dir="rtl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">خوش آمدید</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSignIn}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">نام کاربری</Label>
                  {/* 2. Align input text to the right */}
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="text-right"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">رمز عبور</Label>
                  {/* 2. Align input text to the right */}
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="text-right"
                  />
                </div>
                <Button type="submit" className="w-full">
                  ورود
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default SignInPage;
