export async function handler() {
  try {
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

    await sendEmailRequest.text();
  } catch (e) {
    console.error(
      "Error thrown while attempting to trigger status report email",
      e
    );
  }
}
