import {
  VerifySesDomain,
  VerifySesEmailAddress,
} from "@seeebiii/ses-verify-identities";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Tags } from "aws-cdk-lib/core";
import { type SSTConfig } from "sst";
import { NextjsSite } from "sst/constructs";
export default {
  config(_input) {
    return {
      name: "inveniam",
      region: "us-east-1",
    };
  },
  stacks(app) {
    Tags.of(app).add("inveniam", `${app.stage}-${app.region}`);

    app.stack(function Site({ stack }) {
      const hostedZone = route53.HostedZone.fromLookup(stack, "HostedZone", {
        domainName: "illizen.com",
      });

      const certificate = new acm.DnsValidatedCertificate(
        stack,
        "Certificate",
        {
          domainName: "inveniam.illizen.com",
          hostedZone,
          region: "us-east-1",
        }
      );

      new VerifySesDomain(stack, "SesDomainVerification", {
        domainName: "illizen.com",
      });

      new VerifySesEmailAddress(stack, "SesEmailVerification", {
        emailAddress: "fillip1984@gmail.com",
      });

      // TODO: Should switch to storing in aws Secrets but haven't spent the time figuring out how to get it back out for primsa. See: https://docs.sst.dev/config#overview
      const DATABASE_URL = process.env.DATABASE_URL;
      if (!DATABASE_URL) {
        throw new Error(
          "unable to find database url, it needs to be defined in a .env file or provided by your CI as DATABASE_URL...example is provided in .env.example"
        );
      }

      const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
      if (!NEXTAUTH_SECRET) {
        throw new Error("Unable to find NEXTAUTH_SECRET");
      }

      const NEXTAUTH_URL = process.env.NEXTAUTH_URL;
      if (!NEXTAUTH_URL) {
        throw new Error("Unable to find NEXTAUTH_URL");
      }

      const NEXTAUTH_GITHUB_CLIENT_ID = process.env.NEXTAUTH_GITHUB_CLIENT_ID;
      if (!NEXTAUTH_GITHUB_CLIENT_ID) {
        throw new Error("Unable to find NEXTAUTH_GITHUB_CLIENT_ID");
      }

      const NEXTAUTH_GITHUB_CLIENT_SECRET =
        process.env.NEXTAUTH_GITHUB_CLIENT_SECRET;
      if (!NEXTAUTH_GITHUB_CLIENT_SECRET) {
        throw new Error("Unable to find NEXTAUTH_GITHUB_CLIENT_SECRET");
      }

      const NEXTAUTH_GOOGLE_CLIENT_ID = process.env.NEXTAUTH_GOOGLE_CLIENT_ID;
      if (!NEXTAUTH_GOOGLE_CLIENT_ID) {
        throw new Error("Unable to find NEXTAUTH_GOOGLE_CLIENT_ID");
      }

      const NEXTAUTH_GOOGLE_CLIENT_SECRET =
        process.env.NEXTAUTH_GOOGLE_CLIENT_SECRET;
      if (!NEXTAUTH_GOOGLE_CLIENT_SECRET) {
        throw new Error("Unable to find NEXTAUTH_GOOGLE_CLIENT_SECRET");
      }

      const site = new NextjsSite(stack, "site", {
        customDomain: {
          domainName: "inveniam.illizen.com",
          domainAlias: "www.inveniam.illizen.com",
          cdk: {
            hostedZone,
            certificate,
          },
        },
        environment: {
          DATABASE_URL,
          NEXTAUTH_SECRET,
          NEXTAUTH_URL,
          NEXTAUTH_GITHUB_CLIENT_ID,
          NEXTAUTH_GITHUB_CLIENT_SECRET,
          NEXTAUTH_GOOGLE_CLIENT_ID,
          NEXTAUTH_GOOGLE_CLIENT_SECRET,
        },
      });

      stack.addOutputs({
        SiteUrl: site.customDomainUrl || site.url,
      });
    });
  },
} satisfies SSTConfig;
