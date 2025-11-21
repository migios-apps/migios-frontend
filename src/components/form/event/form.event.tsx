import React, { useState } from "react"

const EventGenerator: React.FC = () => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [endTime, setEndTime] = useState<string | null>(null)
  const [backgroundColor, setBackgroundColor] = useState("#f5f5f5")
  const [color, setColor] = useState("#f5f5f5")
  const [frequency, setFrequency] = useState<
    "hourly" | "daily" | "weekly" | "monthly" | "yearly" | null
  >(null)
  const [interval, setInterval] = useState<number>(1)
  const [selectedMonths, setSelectedMonths] = useState<number[]>([])
  const [selected_weekdays, setselected_weekdays] = useState<
    { dayOfWeek: string; startTime: string; endTime: string }[]
  >([])
  const [generatedJSON, setGeneratedJSON] = useState<string | null>(null)
  const [weekNumber, setWeekNumber] = useState<number[]>([])
  const [endType, setEndType] = useState<"on" | "forever">("on")

  const handleFrequencyChange = (
    newFrequency: "hourly" | "daily" | "weekly" | "monthly" | "yearly"
  ) => {
    setFrequency(newFrequency)
    setStartTime(null)
    setEndTime(null)
    setInterval(1)
    setSelectedMonths([])
    setselected_weekdays([])
    setWeekNumber([])
  }

  const addWeekdaySchedule = () => {
    setselected_weekdays([
      ...selected_weekdays,
      { dayOfWeek: "", startTime: "", endTime: "" },
    ])
  }

  const updateWeekdaySchedule = (index: number, key: string, value: string) => {
    const updatedWeekdays = selected_weekdays.map((weekday, i) =>
      i === index ? { ...weekday, [key]: value } : weekday
    )
    setselected_weekdays(updatedWeekdays)
  }

  const removeWeekdaySchedule = (index: number) => {
    setselected_weekdays(selected_weekdays.filter((_, i) => i !== index))
  }

  const generateJSON = () => {
    if (!title || !startDate || !endDate || !frequency) {
      alert("Please fill in all required fields.")
      return
    }

    const eventJSON = {
      title,
      description,
      start: new Date(startDate).toISOString(),
      end: new Date(endDate).toISOString(),
      startTime:
        frequency === "hourly" || frequency === "daily" ? startTime : undefined,
      endTime:
        frequency === "hourly" || frequency === "daily" ? endTime : undefined,
      backgroundColor,
      color,
      frequency,
      interval:
        frequency === "monthly" || frequency === "yearly" ? interval : 0,
      selectedMonths: frequency === "yearly" ? selectedMonths : [],
      weekNumber: frequency === "monthly" ? weekNumber : [],
      selected_weekdays:
        frequency === "weekly" ||
        frequency === "monthly" ||
        frequency === "yearly"
          ? selected_weekdays
          : [],
      endType,
    }

    setGeneratedJSON(JSON.stringify(eventJSON, null, 2))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Event Generator</h1>

      <label className="mb-2 block font-semibold">Title</label>
      <input
        type="text"
        value={title}
        className="mb-4 block w-full rounded border border-gray-300 p-2"
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="mb-2 block font-semibold">Description</label>
      <textarea
        value={description}
        className="mb-4 block w-full rounded border border-gray-300 p-2"
        onChange={(e) => setDescription(e.target.value)}
      />

      <label className="mb-2 block font-semibold">Frequency</label>
      <select
        value={frequency || ""}
        className="mb-4 block w-full rounded border border-gray-300 p-2"
        onChange={(e) => handleFrequencyChange(e.target.value as any)}
      >
        <option value="">Select Frequency</option>
        <option value="hourly">Hourly</option>
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>

      <label className="mb-2 block font-semibold">Background Color</label>
      <input
        type="color"
        value={backgroundColor}
        className="mb-4 block w-full rounded border border-gray-300 p-2"
        onChange={(e) => setBackgroundColor(e.target.value)}
      />

      <label className="mb-2 block font-semibold">Color</label>
      <input
        type="color"
        value={color}
        className="mb-4 block w-full rounded border border-gray-300 p-2"
        onChange={(e) => setColor(e.target.value)}
      />

      <label className="mb-2 block font-semibold">Start Date</label>
      <input
        type="date"
        value={startDate || ""}
        className="mb-4 block w-full rounded border border-gray-300 p-2"
        onChange={(e) => setStartDate(e.target.value || null)}
      />

      <label className="mb-2 block font-semibold">End Date</label>
      <input
        type="date"
        value={endDate || ""}
        className="mb-4 block w-full rounded border border-gray-300 p-2"
        onChange={(e) => setEndDate(e.target.value || null)}
      />

      {(frequency === "hourly" || frequency === "daily") && (
        <>
          <label className="mb-2 block font-semibold">Start Time</label>
          <input
            type="time"
            value={startTime || ""}
            className="mb-4 block w-full rounded border border-gray-300 p-2"
            onChange={(e) => setStartTime(e.target.value || null)}
          />

          <label className="mb-2 block font-semibold">End Time</label>
          <input
            type="time"
            value={endTime || ""}
            className="mb-4 block w-full rounded border border-gray-300 p-2"
            onChange={(e) => setEndTime(e.target.value || null)}
          />
        </>
      )}

      <label className="mb-2 block font-semibold">End Type</label>
      <select
        value={endType}
        className="mb-4 block w-full rounded border border-gray-300 p-2"
        onChange={(e) => setEndType(e.target.value as "on" | "forever")}
      >
        <option value="on">On</option>
        <option value="forever">Forever</option>
      </select>

      {(frequency === "monthly" || frequency === "yearly") && (
        <>
          <label className="mb-2 block font-semibold">Interval</label>
          <input
            type="number"
            value={interval}
            min="1"
            className="mb-4 block w-full rounded border border-gray-300 p-2"
            onChange={(e) => setInterval(parseInt(e.target.value))}
          />
        </>
      )}

      {frequency === "monthly" && (
        <>
          <label className="mb-2 block font-semibold">Select Week</label>
          <div className="mb-4 flex flex-wrap gap-4">
            {[1, 2, 3, 4, -1].map((week) => (
              <label key={week} className="flex items-center">
                <input
                  type="checkbox"
                  value={week}
                  checked={weekNumber.includes(week)}
                  className="mr-2"
                  onChange={() => {
                    if (weekNumber.includes(week)) {
                      setWeekNumber(weekNumber.filter((w) => w !== week))
                    } else {
                      setWeekNumber([...weekNumber, week])
                    }
                  }}
                />
                {week === -1 ? "Last" : `Week ${week}`}
              </label>
            ))}
          </div>
        </>
      )}

      {frequency === "yearly" && (
        <>
          <label className="mb-2 block font-semibold">Selected Months</label>
          <div className="mb-4 flex flex-wrap gap-4">
            {[...Array(12).keys()].map((month) => {
              const monthValue = month + 1
              return (
                <label key={monthValue} className="flex items-center">
                  <input
                    type="checkbox"
                    value={monthValue}
                    checked={selectedMonths.includes(monthValue)}
                    className="mr-2"
                    onChange={() => {
                      if (selectedMonths.includes(monthValue)) {
                        setSelectedMonths(
                          selectedMonths.filter((m) => m !== monthValue)
                        )
                      } else {
                        setSelectedMonths([...selectedMonths, monthValue])
                      }
                    }}
                  />
                  {new Date(0, month).toLocaleString("default", {
                    month: "long",
                  })}
                </label>
              )
            })}
          </div>
        </>
      )}

      {(frequency === "weekly" ||
        frequency === "monthly" ||
        frequency === "yearly") && (
        <>
          <label className="mb-2 block font-semibold">Weekday Schedules</label>
          {selected_weekdays.map((weekday, index) => (
            <div key={index} className="mb-4 flex items-center gap-2">
              <select
                value={weekday.day_of_week}
                className="rounded border border-gray-300 p-2"
                onChange={(e) =>
                  updateWeekdaySchedule(index, "dayOfWeek", e.target.value)
                }
              >
                <option value="">Select Day</option>
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
              </select>

              <input
                type="time"
                value={weekday.start_time}
                className="rounded border border-gray-300 p-2"
                onChange={(e) =>
                  updateWeekdaySchedule(index, "startTime", e.target.value)
                }
              />

              <input
                type="time"
                value={weekday.end_time}
                className="rounded border border-gray-300 p-2"
                onChange={(e) =>
                  updateWeekdaySchedule(index, "endTime", e.target.value)
                }
              />

              <button
                className="rounded bg-red-500 p-1 text-white"
                onClick={() => removeWeekdaySchedule(index)}
              >
                Remove
              </button>
            </div>
          ))}

          <button
            className="mb-4 rounded bg-green-500 p-2 text-white"
            onClick={addWeekdaySchedule}
          >
            Add Weekday Schedule
          </button>
        </>
      )}

      <button
        className="rounded bg-blue-500 p-2 text-white"
        onClick={generateJSON}
      >
        Generate JSON
      </button>

      {generatedJSON && (
        <div className="mt-4">
          <h2 className="mb-2 text-xl font-semibold">Generated JSON</h2>
          <pre className="rounded bg-gray-100 p-4">{generatedJSON}</pre>
        </div>
      )}
    </div>
  )
}

export default EventGenerator
