import { ApiPromise, WsProvider } from '@polkadot/api';
import {ChangeEventHandler, Fragment, useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {MerkleTree} from 'merkletreejs';
import SHA256 from 'crypto-js/sha256'
import {useAsync} from 'react-use'
import {Buffer} from 'buffer'
import {Header} from '@polkadot/types/interfaces'
import {useDebounce} from 'use-debounce'
import { BlockHeader } from './BlockHeader';

const BATCH_LIMIT = 5

export default function App() {
  const [leaves, setLeaves] = useState<string[]>([])
  const headerHashesRef = useRef<Record<string, true>>({})

  const [search, setSearch] = useState('')
  const [debouncedSearch] = useDebounce(search, 300)

  const [trees, setTrees] = useState<MerkleTree[]>([])
  const [headers, setHeaders] = useState<Map<string, {isVerified: boolean | null; data: Header}>>(() => new Map())
  const [headerBlockMap, setHeaderBlockMap] = useState<Map<number, string>>(() => new Map())

  const unsubRef = useRef<undefined | VoidFunction>(undefined)

  const addLeaf = (leaf: string) => {
    setLeaves(prev => [...prev, leaf])
  }

  const addHeader = (header: Header) => {
    const headerHex = header.toHex()
    const blockNumber = header.number.toNumber()

    setHeaders(prev => new Map(prev.entries()).set(headerHex, {isVerified: null, data: header}))
    setHeaderBlockMap(prev => new Map(prev.entries()).set(blockNumber, headerHex))
  }

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
        return new Map(Array.from(prev.entries()).map(([hash, header]) => {
          if (header.isVerified) return [hash, header]

          const proofByHash = proofs[hash]
          const isVerified = proofByHash && tree.verify(proofByHash.proof, hash, tree.getRoot().toString('hex'))

          return [hash, {isVerified, data: header.data}]
        }))
      })
      setLeaves([])
      headerHashesRef.current = {}
    }
  }, [createMerkleTree, leaves])

  useAsync(async () => {
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });

    const unsub = await api.rpc.chain.subscribeNewHeads((header) => {
      const headerHex = header.toHex()
      if (headerHashesRef.current[headerHex]) return
      headerHashesRef.current[headerHex] = true

      addLeaf(headerHex)
      addHeader(header)
    });

    unsubRef.current = unsub
  }, [])

  useEffect(() => unsubRef.current, [])

  const searchedHeader = useMemo(() => {
    let hash: string = ''

    if (!isNaN(parseInt(debouncedSearch))) {
      const hashByNumber = headerBlockMap.get(parseInt(debouncedSearch))

      if (hashByNumber) {
        hash = hashByNumber
      }
    }

    if (!hash) {
      hash = debouncedSearch
    }

    return headers.get(hash)
  }, [debouncedSearch, headerBlockMap, headers])

  const headersToRender = useMemo(() => Array.from(headers.entries()).reverse().slice(0, 150), [headers])

  const handleSearch: ChangeEventHandler<HTMLInputElement> = ({target: {value}}) => setSearch(value)

  return (
    <div className="h-dvh flex flex-col gap-y-12 p-32 items-center after:absolute after:-z-10 after:inset-0 after:bg-[radial-gradient(circle,rgba(100,0,150,0.05)_0%,rgba(255,255,255,0)_50%)]">
      <div className="flex flex-col gap-y-6">
        <h1 className="font-medium text-center text-6xl">t3rn challenge</h1>
        <cite
          className="pl-4 flex max-w-screen-sm gap-x-4 before:flex before:w-4 before:rounded-full before:h-full before:bg-black"
        >
          In this challenge, you will be building a Polkadot block header light client. The program should
          listen to new Polkadot headers, and store sequential batches of them inside a Merkle tree. The
          stored data should be accessible in some form of your choosing and fulfill the following
          attributes.
        </cite>
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

        {search.length === 0 && headersToRender.length > 10 && (
          <div className="text-center p-6 pb-12 text-xl font-medium">No virtualization 🤷</div>
        )}
      </div>
    </div>
  )
}
