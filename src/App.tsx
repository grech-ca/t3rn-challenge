import {ChangeEventHandler, Fragment, useCallback, useEffect, useMemo, useState} from 'react'
import {MerkleTree} from 'merkletreejs';
import SHA256 from 'crypto-js/sha256'
import {Buffer} from 'buffer'
import {Header} from '@polkadot/types/interfaces'
import {useDebounce} from 'use-debounce'
import { BlockHeader } from './BlockHeader';
import { Note } from './Note';
import { GithubLink } from './GithubLink';
import { useHeaderSubscription } from './hooks/use-header-subscription';

// NOTE: I picked 15 so you wouldn't need to wait for all headers get validated for so long
const BATCH_LIMIT = 15

export default function App() {
  const [leaves, setLeaves] = useState<string[]>([])
  const [trees, setTrees] = useState<MerkleTree[]>([])
  const [headers, setHeaders] = useState<Record<string, {isVerified: boolean | null; data: Header}>>({})
  // NOTE: headerBlockMap is used for instant search for headers by block number,
  //       so it's literally just Map(blockNumber -> headerHash)
  const [headerBlockMap, setHeaderBlockMap] = useState<Map<number, string>>(() => new Map())
  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 300)

  const addHeader = useCallback((header: Header) => {
    const headerHex = header.toHex()
    const blockNumber = header.number.toNumber()

    setLeaves(prev => [...prev, headerHex])
    setHeaders(prev => ({...prev, [headerHex]: {isVerified: null, data: header}}))
    setHeaderBlockMap(prev => new Map(prev.entries()).set(blockNumber, headerHex))
  }, [])

  const createMerkleTree = useCallback((leaves: string[]) => {
    const tree = new MerkleTree(leaves, SHA256, { concatenator: Buffer.concat })
    setTrees(prev => [...prev, tree])

    const leafProofs = Object.fromEntries(leaves.map(leaf => {
      const proof = tree.getProof(leaf)
      return [leaf, {treeIndex: trees.length, proof}]
    }))

    return {tree, proofs: leafProofs}
  }, [trees.length])

  useEffect(() => {
    if (leaves.length === BATCH_LIMIT) {
      const {tree, proofs} = createMerkleTree(leaves)
      setHeaders(prev => {
        return Object.fromEntries(Object.entries(prev).map(([hash, header]) => {
          if (header.isVerified) return [hash, header]

          const proofByHash = proofs[hash]
          const isVerified = proofByHash && tree.verify(proofByHash.proof, hash, tree.getRoot().toString('hex'))

          return [hash, {isVerified, data: header.data}]
        }))
      })
      setLeaves([])
    }
  }, [createMerkleTree, leaves])

  useHeaderSubscription(addHeader)

  const searchedHeader = useMemo(() => {
    let hash: string = ''

    // NOTE: If the search value is not a number, it's considered as hash
    if (!isNaN(parseInt(debouncedSearch))) {
      const hashByNumber = headerBlockMap.get(parseInt(debouncedSearch))

      if (hashByNumber) {
        hash = hashByNumber
      }
    }

    if (!hash) {
      hash = debouncedSearch
    }

    return headers[hash]
  }, [debouncedSearch, headerBlockMap, headers])

  const headersToRender = useMemo(() => Object.entries(headers).reverse(), [headers])

  const handleSearch: ChangeEventHandler<HTMLInputElement> = ({target: {value}}) => setSearch(value)

  return (
    <div className="h-dvh flex flex-col gap-y-12 p-32 items-center after:absolute after:-z-10 after:inset-0 after:bg-[radial-gradient(circle,rgba(100,0,150,0.05)_0%,rgba(255,255,255,0)_50%)]">
      <GithubLink />
      <div className="flex flex-col gap-y-6">
        <h1 className="font-medium text-center text-6xl">t3rn challenge</h1>
        <Note />
      </div>
      <div className="grid gap-y-12">
        <label className="w-[24rem] grid gap-y-4">
          <p className="text-center text-2xl">Search headers</p>
          <input
            className="bg-white rounded-lg p-2 outline-none text-center shadow-xl shadow-black/5"
            placeholder="Block number or hash"
            value={search}
            onChange={handleSearch}
          />
        </label>

        <div className="flex flex-col gap-y-4">
          {search.length > 0 ? (
            <Fragment>
              {searchedHeader && (
                <BlockHeader isVerified={searchedHeader.isVerified} header={searchedHeader.data} />
              )}
            </Fragment>
          ) : (
            headersToRender.map(([hash, header], index) => (
              <BlockHeader showNewBadge={index === 0} key={hash} header={header.data} isVerified={header.isVerified} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
