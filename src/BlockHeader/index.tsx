import {Transition} from '@headlessui/react'
import {Header} from '@polkadot/types/interfaces'
import { Field } from './Field'
import { Fragment } from 'react'

export type BlockHeaderProps = {
  header: Header
  isVerified: boolean | null
  showNewBadge?: boolean
}

export const BlockHeader = ({header, isVerified, showNewBadge = false}: BlockHeaderProps) => {
  return (
    <Transition
      show
      appear
      as="div"
      className="overflow-visible"
      enter="transition-all duration-300"
      enterFrom="scale-90 h-[92px] opacity-0"
      enterTo="scale-100 h-[184px] opacity-100"
    >
      <div className="grid grid-cols-[auto_1fr] gap-y-3 gap-x-4 bg-white shadow-black/5 shadow-xl rounded-lg p-4 relative">
        <div className="aspect-square right-5 top-5 absolute h-5 flex items-center justify-center">
          {isVerified === null && (
            <div className="h-full w-full rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
          )}

          {isVerified !== null && (
            <span className="text-xl">{isVerified ? '✅' : '❌'}</span>
          )}
        </div>

        <div className="flex items-center gap-x-2 col-span-2">
          <div className="text-xl font-medium">Block #{header.number.toNumber()}</div>
          <Transition show={showNewBadge} appear enter="transition-all delay-[2s] duration-500" enterFrom="translate-x-0 opacity-100" enterTo="translate-x-1/4 opacity-0" as={Fragment}>
            <div className="opacity-0 font-medium bg-red-100 text-red-400 leading-none rounded-lg p-1.5 text-sm">New</div>
          </Transition>
        </div>
        <Field
          name="Hash"
          value={header.toHex()}
        />
        <Field
          name="Parent hash"
          value={header.parentHash.toHex()}
        />
        <Field
          name="Root hash"
          value={header.stateRoot.toHex()}
        />
      </div>
    </Transition>
  )
}
