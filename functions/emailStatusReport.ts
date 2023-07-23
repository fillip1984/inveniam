export async function handler() {
  try {
    console.log("cron job - triggering status report email");
    const sendEmailRequest = await fetch(
      "https://inveniam.illizen.com/api/trpc/tasks.sendReportEmail"
    );

    if (!sendEmailRequest.ok) {
      console.error(
        "Failed to trigger status report email",
        sendEmailRequest.status,
        sendEmailRequest.statusText
      );
      return;
    }

    const response = await sendEmailRequest.text();

    console.log("cron job - triggered status report email", response);
  } catch (e) {
    console.error(
      "Error thrown while attempting to trigger status report email",
      e
    );
  }
}
