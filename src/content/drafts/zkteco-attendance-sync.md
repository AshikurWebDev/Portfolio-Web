The coaching center already had ZKTeco fingerprint terminals at the door. Staff punched in, students punched in, and every punch sat inside the device until someone exported it by hand. The ERP knew about fees and exams, but attendance lived in a box on the wall.

This note is about getting those punches into the ERP without losing any and without counting any twice. The integration is still in progress, so this is the design I am building, not a finished story.

::layer{id=data}

## What the device actually gives you

A terminal keeps a log of attendance records. Each record is small:

| Field | Example | Notes |
| --- | --- | --- |
| Device user id | `1047` | The number enrolled on the terminal, not the ERP's student id |
| Timestamp | `2026-11-12 08:41:07` | Device clock, local time, no time zone |
| Verify mode | fingerprint | Fingerprint, card or PIN |
| Device serial | `CQZ7…` | Which terminal recorded it |

Two details matter more than they look. The user id is the terminal's own number, so the ERP needs a mapping from device user to student or staff member. And the timestamp comes from the device clock, which drifts and can be reset.

::figure{id=zkteco-sync caption="Punches move from the terminal to the ERP through one sync worker. The API never talks to the device."}

::layer{id=logic}

## One worker, one job

Getting records off a terminal works two ways: pull them over the network with the vendor SDK, or let the device push them to an HTTP endpoint. Either way I keep that code in one small worker, separate from the API:

- The API stays clean. It receives attendance records in the ERP's own shape and does not know the device protocol exists.
- If the device is offline, the worker retries later. Nobody's request waits on a fingerprint terminal.
- Replacing the terminal model later means changing the worker, not the ERP.

```csharp
public sealed class AttendanceSyncWorker(
    IDeviceClient device,
    IAttendanceApi api,
    ILogger<AttendanceSyncWorker> log) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(2));
        do
        {
            try
            {
                var punches = await device.ReadNewPunchesAsync(ct);
                if (punches.Count > 0)
                    await api.SubmitAsync(punches, ct);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // Device offline or API down: log and try again next tick.
                log.LogWarning(ex, "Attendance sync failed; retrying");
            }
        } while (await timer.WaitForNextTickAsync(ct));
    }
}
```

## Never count a punch twice

The worker will send the same punch more than once: after a retry, after a restart, or when a pull overlaps the last one. So the ERP treats a punch as a fact with a natural key, the device serial, the device user id and the timestamp, and stores it once.

```sql
CREATE UNIQUE INDEX ux_punch_natural_key
    ON attendance_punch (device_serial, device_user_id, punched_at);
```

With that index in place, sending the same batch twice is harmless. The insert skips rows that already exist, and the worker does not need to remember exactly where it stopped.

::layer{id=api}

## Turning punches into attendance

A punch is not attendance yet. Rules decide what it means: the first punch of the day is arrival, a punch after the class ends is departure, and a student with no punch by a cut-off time is absent. Those rules live in the business logic, next to fees and exams, and they read the stored punches. That keeps two things separate:

- **What happened**, the raw punches, which never change.
- **What it means**, the attendance status, which can be recalculated if a rule changes.

When the rules change, attendance is recalculated from the punches. Nothing is lost, because the facts were never overwritten.

## What is still open

- **Clock drift.** I plan to compare the device clock with the server on every sync and log a warning past a few minutes, rather than silently correcting times.
- **Unmapped users.** A punch from a device user with no ERP mapping is kept and flagged for staff, not dropped.
- **Door access.** The same terminals control the door; that part comes after attendance is stable.
