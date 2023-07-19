import { Button } from "@react-email/button";
import { Html } from "@react-email/html";
import { render } from "@react-email/render";

interface EmailProps {
  url: string;
}

const Email: React.FC<Readonly<EmailProps>> = ({ url }) => {
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

export const renderClickMeEmail = ({ url }: EmailProps) => {
  return render(<Email url={url} />);
};
