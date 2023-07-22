import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import { format } from "date-fns";
import { type StatusReportType } from "~/utils/types";

export const StatusReportEmail = ({ status }: { status: StatusReportType }) => {
  return (
    <Html>
      <Head />
      <Preview>
        Overdue: {status.overdue.length.toString()}, Today:{" "}
        {status.dueToday.length.toString()}
      </Preview>
      <Body>
        <Tailwind
          config={{
            theme: {
              extend: {
                colors: {
                  primary: "#6E7E85",
                  secondary: "#E2E2E2",
                  accent: "#B7CECE",
                  accent2: "#BBBAC6",
                  black: "#1C0F13",
                  white: "#ffffff",
                  danger: "#EB4C7C",
                  warning: "#F0E3B2",
                },
              },
            },
          }}>
          <Container className="mx-auto w-4/5">
            <Section className="my-2 text-center text-2xl">
              <Row>
                <h2>{format(new Date(), "EEEE (M/dd)")}</h2>
              </Row>
              <Row>
                <Button
                  href="https://inveniam.illizen.com"
                  className="rounded bg-black px-4 py-2 text-2xl text-white">
                  Go to inveniam
                </Button>
              </Row>
            </Section>

            <Section className="my-8">
              <Row>
                <Column
                  align="center"
                  className="w-[100px] rounded-t-lg bg-danger/30 text-2xl">
                  <Text className="text-xl">Overdue</Text>
                </Column>
                <Column
                  align="center"
                  className="w-[100px] rounded-t-lg bg-accent/30 text-2xl">
                  <Text className="text-xl">Today</Text>
                </Column>
              </Row>
              <Row>
                <Column
                  align="center"
                  className="w-[100px] rounded-b-lg bg-danger/30">
                  <Text className="text-6xl">{status.overdue.length}</Text>
                </Column>
                <Column
                  align="center"
                  className="w-[100px] rounded-b-lg bg-accent/30">
                  <Text className="text-6xl">{status.dueToday.length}</Text>
                </Column>
              </Row>
              <Row>
                <Column
                  align="center"
                  className="w-[100px] rounded-t-lg bg-accent2/30 text-xl">
                  <Text className="text-xl">This Week</Text>
                </Column>
                <Column
                  align="center"
                  className="w-[100px] rounded-t-lg bg-warning/30 text-xl">
                  <Text className="text-xl">Completed</Text>
                </Column>
              </Row>
              <Row>
                <Column
                  align="center"
                  className="w-[100px] rounded-b-lg bg-accent2/30">
                  <Text className="text-6xl">{status.dueThisWeek.length}</Text>
                </Column>
                <Column
                  align="center"
                  className="w-[100px] rounded-b-lg bg-warning/30">
                  <Text className="text-6xl">
                    {status.completedThisWeek.length}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section className="my-2 rounded-xl bg-danger/30 px-1">
              <Row>
                <h3 className="mb-2 font-bold text-danger">Overdue</h3>
                {status.overdue.length === 0 && (
                  <p className="text-xs">Nothing overdue</p>
                )}

                {status.overdue.map((task) => (
                  <div key={task.id}>
                    <label>
                      <input type="checkbox" className="mx-2 rounded-full" />
                      {task.text}
                    </label>
                  </div>
                ))}
              </Row>
            </Section>

            <Section className="my-2 rounded-xl bg-accent/30 px-1">
              <Row>
                <h3 className="mb-2 font-bold text-accent">Today</h3>
                {status.dueToday.length === 0 && (
                  <p className="text-xs">Nothing due</p>
                )}
                {status.dueToday.map((task) => (
                  <div key={task.id}>
                    <label>
                      <input type="checkbox" className="mx-2 rounded-full" />
                      {task.text}
                    </label>
                  </div>
                ))}
              </Row>
            </Section>

            <Section className="my-2 rounded-xl bg-accent2/30 px-1">
              <Row>
                <h3 className="mb-2 font-bold text-accent2">This Week</h3>
                {status.dueThisWeek.length === 0 && (
                  <p className="text-xs">Nothing due</p>
                )}
                {status.dueThisWeek.map((task) => (
                  <div key={task.id}>
                    <label>
                      <input type="checkbox" className="mx-2 rounded-full" />
                      {task.text}
                    </label>
                  </div>
                ))}
              </Row>
            </Section>

            <Section className="my-2 rounded-xl bg-warning/30 px-1">
              <Row>
                <h3 className="mb-2 font-bold text-warning">Completed</h3>
                {status.completedThisWeek.length === 0 && (
                  <p className="text-xs">No tasks have been completed...yet!</p>
                )}
                {status.completedThisWeek.map((task) => (
                  <div key={task.id}>
                    <label>
                      <input type="checkbox" className="mx-2 rounded-full" />
                      {task.text}
                    </label>
                  </div>
                ))}
              </Row>
            </Section>
          </Container>
        </Tailwind>
      </Body>
    </Html>
  );
};

export const renderStatusReportEmail = (status: StatusReportType) => {
  return render(<StatusReportEmail status={status} />);
};
