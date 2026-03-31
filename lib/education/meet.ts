type CreateMeetInput = {
  title: string;
  description?: string;
  scheduledAt: Date;
  durationMinutes: number;
};

export async function tryCreateGoogleMeetLink(input: CreateMeetInput): Promise<string> {
  const accessToken = process.env.GOOGLE_CALENDAR_ACCESS_TOKEN;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!accessToken || !calendarId) {
    throw new Error("Google Calendar API is not configured. Set GOOGLE_CALENDAR_ACCESS_TOKEN and GOOGLE_CALENDAR_ID.");
  }

  const end = new Date(input.scheduledAt.getTime() + input.durationMinutes * 60 * 1000);

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?conferenceDataVersion=1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: input.title,
        description: input.description ?? "",
        start: { dateTime: input.scheduledAt.toISOString() },
        end: { dateTime: end.toISOString() },
        conferenceData: {
          createRequest: {
            requestId: `sba-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const details = await res.text().catch(() => "");
    throw new Error(`Google Meet creation failed: ${details || res.statusText}`);
  }

  const payload = (await res.json()) as {
    hangoutLink?: string;
    conferenceData?: { entryPoints?: Array<{ uri?: string }> };
  };

  const fromHangout = payload.hangoutLink;
  const fromEntryPoint = payload.conferenceData?.entryPoints?.find((p) => p.uri?.includes("meet.google.com"))?.uri;
  const meetLink = fromHangout || fromEntryPoint;

  if (!meetLink) {
    throw new Error("Google Meet link was not returned by Calendar API.");
  }

  return meetLink;
}
