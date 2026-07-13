using LuminaLms.Domain.Enums;

namespace LuminaLms.Application.Common;

/// <summary>
/// Class-day-of-week logic ported verbatim from attendanceService.js. Note "Tts"
/// deliberately maps to Tue/Thu/Sat (not Sun) — that's the source app's actual
/// behavior despite the name suggesting otherwise; preserved as-is.
/// </summary>
public static class ScheduleCalculator
{
    public static bool IsClassDay(ScheduleType scheduleType, DayOfWeek day) => scheduleType switch
    {
        ScheduleType.Daily => day is >= DayOfWeek.Monday and <= DayOfWeek.Friday,
        ScheduleType.Weekend => day is DayOfWeek.Saturday or DayOfWeek.Sunday,
        ScheduleType.Mwf => day is DayOfWeek.Monday or DayOfWeek.Wednesday or DayOfWeek.Friday,
        ScheduleType.Tts => day is DayOfWeek.Tuesday or DayOfWeek.Thursday or DayOfWeek.Saturday,
        _ => false,
    };

    public static int ExpectedClassesInMonth(ScheduleType scheduleType, int year, int month)
    {
        var daysInMonth = DateTime.DaysInMonth(year, month);
        var count = 0;
        for (var day = 1; day <= daysInMonth; day++)
        {
            if (IsClassDay(scheduleType, new DateOnly(year, month, day).DayOfWeek)) count++;
        }
        return count;
    }
}
