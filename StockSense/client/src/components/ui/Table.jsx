export default function Table({ columns, rows, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[12px] whitespace-nowrap">
        <thead className="bg-[#f8faf7]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="border-y border-[#e7ede9] px-5 py-2.5 text-[9px] font-semibold tracking-[0.65px] text-[#63736a] max-[1250px]:px-4"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-[#fafcf8]">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="border-b border-[#edf1ee] px-5 py-3 text-[#53645a] max-[1250px]:px-4 [&_strong]:font-semibold [&_strong]:text-[#354d3e]"
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && empty}
    </div>
  )
}
