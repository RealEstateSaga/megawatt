import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PASS = "@Malachi1";

interface PasswordGateProps {
  onUnlock: () => void;
}

const PasswordGate = ({ onUnlock }: PasswordGateProps) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === PASS) {
      sessionStorage.setItem("lp_auth", "1");
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-72">
        <h1
          className="text-2xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Lead Pro
        </h1>
        <Input
          type="password"
          placeholder="Password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={error ? "border-destructive" : ""}
          autoFocus
        />
        {error && (
          <p className="text-xs text-destructive -mt-4">Incorrect password</p>
        )}
        <Button type="submit" className="w-full tracking-widest">
          ENTER
        </Button>
      </form>
    </div>
  );
};

export default PasswordGate;
