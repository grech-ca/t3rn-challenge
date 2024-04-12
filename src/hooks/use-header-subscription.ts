import { ApiPromise, WsProvider } from "@polkadot/api";
import {Header} from '@polkadot/types/interfaces'
import { useEffect, useRef } from "react";
import { useAsync } from "react-use";

export const useHeaderSubscription = (cb: (header: Header) => void | Promise<void>) => {
  const unsubRef = useRef<undefined | VoidFunction>(undefined)

  useAsync(async () => {
    const wsProvider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider: wsProvider });

    const unsub = await api.rpc.chain.subscribeNewHeads(cb);

    unsubRef.current = unsub
  }, [cb])

  useEffect(() => unsubRef.current, [])
}
