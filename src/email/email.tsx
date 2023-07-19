import { Button } from "@react-email/button";
import { Html } from "@react-email/html";
import * as React from "react";

interface EmailProps {
  url: string;
}

export const Email: React.FC<Readonly<EmailProps>> = ({ url }) => {
  return (
    <Html>
      <Button
        pX={20}
        pY={12}
        href={url}
        style={{ background: "#000", color: "#fff" }}>
        Click me
      </Button>
    </Html>
  );
};
