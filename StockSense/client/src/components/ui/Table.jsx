export default function Table({ columns, rows, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[11px] whitespace-nowrap">
        <thead className="bg-[#f8faf7]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="border-y border-[#edf0eb] px-[21px] py-[13px] text-[8px] font-[550] tracking-[0.7px] text-[#8b9a85] max-[1250px]:px-4"
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
                  className="border-b border-[#f0f3ed] px-[21px] py-4 text-[#73816d] max-[1250px]:px-4 [&_strong]:font-[550] [&_strong]:text-[#42563a]"
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
