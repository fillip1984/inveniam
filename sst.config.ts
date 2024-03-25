import {
  VerifySesDomain,
  VerifySesEmailAddress,
} from "@seeebiii/ses-verify-identities";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as route53 from "aws-cdk-lib/aws-route53";
import { Tags } from "aws-cdk-lib/core";
import { type SSTConfig } from "sst";
import { Bucket, Cron, NextjsSite } from "sst/constructs";
export default {
  config(_input) {
    return {
      name: "inveniam",
      region: "us-east-1",
    };
  },
  stacks(app) {
    Tags.of(app).add(app.name, `${app.stage}-${app.region}`);

    app.stack(function Site({ stack }) {
      const hostedZone = route53.HostedZone.fromLookup(stack, "HostedZone", {
        domainName: "illizen.com",
      });

      const certificate = new acm.DnsValidatedCertificate(
        stack,
        "Certificate",
        {
          domainName: `${app.name}.illizen.com`,
          hostedZone,
          region: "us-east-1",
        }
      );

      //S3 bucket for attachment storage
      const bucket = new Bucket(stack, `${app.name}-attachment-storage`, {
        // blockPublicACLs: true,
      });

      /*
       * To get emails a sendin' you will need to:
       * 1) have a domain already registered and setup (easiest if its Route53)
       * 2) add the following ses contructs from https://github.com/seeebiii/ses-verify-identities/tree/main
       * 3) use attachPermissions (see 'send email iam change' below for how I've accomplished this within SST. Otherwise the rest of step 3 is how to do it manually)
       *    Manually: if you send the emails from your NextJs app, you'll need to add the 'ses:SendEmail' permission to the lambda running your nextjs server. 
       *    To do that, you'll want to go into IAM on aws console, click Roles (under Access management), 
       *    search for the resource that's sending emails. Kknowing which resource to add the permission to can be tricky. 
       *    If you're having trouble you can test sending emails from your application and search through the logs on aws (either by tailing or cloud watch). 
       *    You're looking for someting like: AccessDenied: User `arn:aws:...' is not authorized to perform `ses:SendEmail' on resource `arn:aws:...:identity/email you verified.com'.
       *    I create an inline policy on the resource once I find it:
       *  {
          "Version": "2012-10-17",
          "Statement": [
              {
                  "Effect": "Allow",
                  "Action": [
                      "ses:SendEmail"
                  ],
                  "Resource": [
                      "*"
                  ]
              }
            ]
          }
       * 4) the emailAddress from sesEmailVerification will get an email with a link that will enable it to start receiving emails
       * 5) Send more emails and now they should appear!
       */

      new VerifySesDomain(stack, "SesDomainVerification", {
        domainName: "illizen.com",
      });

      new VerifySesEmailAddress(stack, "SesEmailVerification", {
        emailAddress: "fillip1984@gmail.com",
      });

      // Schedules a lambda cron job to run everyday at 11:30AM (7:30AM Eastern)
      // Should probably learn SQS or SES to trigger events instead of REST call to nextjs server)
      //See: https://docs.sst.dev/constructs/Function
      new Cron(stack, "status-report-email-cron", {
        schedule: "cron(30 11 * * ? *)",
        job: {
          function: {
            runtime: "nodejs18.x",
            handler: "functions/emailStatusReport.handler",
          },
        },
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
          domainName: `${app.name}.illizen.com`,
          domainAlias: `www.${app.name}.illizen.com`,
          cdk: {
            hostedZone,
            certificate,
          },
        },
        bind: [bucket],
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

      // send email iam change allows for NextJS to be able to send emails
      site.attachPermissions([
        new PolicyStatement({
          actions: ["ses:SendEmail"],
          effect: Effect.ALLOW,
          resources: ["*"],
        }),
      ]);

      stack.addOutputs({
        SiteUrl: site.customDomainUrl || site.url,
      });
    });
  },
} satisfies SSTConfig;
