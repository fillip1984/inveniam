import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";

interface EmailProps {
  url: string;
}

const Email = ({ url }: EmailProps) => {
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

const StatusEmail = () => (
  <Html>
    <Head />
    <Body
      style={{
        backgroundColor: "#ffffff",
        fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
      }}>
      <Container
        style={{
          color: "#000",
          display: "inline-block",
          fontFamily: "HelveticaNeue-Bold",
          fontSize: "32px",
          fontWeight: 700,
          letterSpacing: "6px",
          lineHeight: "40px",
          paddingBottom: "8px",
          paddingTop: "8px",
          margin: "0 auto",
          width: "100%",
          textAlign: "center",
        }}>
        {/* <Img
          src={`${baseUrl}/static/plaid-logo.png`}
          width="212"
          height="88"
          alt="Plaid"
          style={{
            margin: "0 auto",
          }}
        /> */}
        <Text
          style={{
            color: "#0a85ea",
            fontSize: "11px",
            fontWeight: 700,
            fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
            height: "16px",
            letterSpacing: "0",
            lineHeight: "16px",
            margin: "16px 8px 8px 8px",
            textTransform: "uppercase" as const,
            textAlign: "center" as const,
          }}>
          Verify Your Identity
        </Text>
        <Heading
          style={{
            color: "#000",
            display: "inline-block",
            fontFamily: "HelveticaNeue-Medium,Helvetica,Arial,sans-serif",
            fontSize: "20px",
            fontWeight: 500,
            lineHeight: "24px",
            marginBottom: "0",
            marginTop: "0",
            textAlign: "center" as const,
          }}>
          Enter the following code to finish linking.
        </Heading>
        <Section
          style={{
            background: "rgba(0,0,0,.05)",
            borderRadius: "4px",
            margin: "16px auto 14px",
            verticalAlign: "middle",
            width: "280px",
          }}>
          <Text
            style={{
              color: "#000",
              display: "inline-block",
              fontFamily: "HelveticaNeue-Bold",
              fontSize: "32px",
              fontWeight: 700,
              letterSpacing: "6px",
              lineHeight: "40px",
              paddingBottom: "8px",
              paddingTop: "8px",
              margin: "0 auto",
              width: "100%",
              textAlign: "center" as const,
            }}>
            TEST TEST TEST
          </Text>
        </Section>
        <Text
          style={{
            color: "#444",
            fontSize: "15px",
            fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
            letterSpacing: "0",
            lineHeight: "23px",
            padding: "0 40px",
            margin: "0",
            textAlign: "center" as const,
          }}>
          Not expecting this email?
        </Text>
        <Text
          style={{
            color: "#444",
            fontSize: "15px",
            fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
            letterSpacing: "0",
            lineHeight: "23px",
            padding: "0 40px",
            margin: "0",
            textAlign: "center" as const,
          }}>
          Contact{" "}
          <Link
            href="mailto:login@plaid.com"
            style={{
              color: "#444",
              textDecoration: "underline",
            }}>
            testing
          </Link>{" "}
          if you did not request this code.
        </Text>
      </Container>
      <Text
        style={{
          color: "#000",
          fontSize: "12px",
          fontWeight: 800,
          letterSpacing: "0",
          lineHeight: "23px",
          margin: "0",
          marginTop: "20px",
          fontFamily: "HelveticaNeue,Helvetica,Arial,sans-serif",
          textAlign: "center" as const,
          textTransform: "uppercase" as const,
        }}>
        Securely powered by Plaid.
      </Text>
    </Body>
  </Html>
);

export const renderStatusEmail = () => {
  return render(<StatusEmail />);
};
