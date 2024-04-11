import {Fragment} from 'react'

export type FieldProps = {
  name: string
  value: string | number
}

export const Field = ({name, value}: FieldProps) => {
  return (
    <Fragment>
      <span>{name}:</span>
      <input
        className="px-2 py-1 rounded-lg bg-gray-100 truncate"
        readOnly
        type="text"
        value={value}
      />
    </Fragment>
  )
}
