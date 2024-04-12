# t3rn challenge

> In this challenge, you will be building a Polkadot block header light client. The program should
listen to new Polkadot headers, and store sequential batches of them inside a Merkle tree. The
stored data should be accessible in some form of your choosing and fulfill the following
attributes.

⚠️ Challenge Attributes:
- Decide on a header batch size and create and write to Merkle tree once the size limit
has been reached
- Store the Merkle trees and corresponding roots in a way you see fit (in-memory is
sufficient)
- Each header should be queryable by block number or hash
- Implement a function that generates the Merkle inclusion proof for each stored header
- Implement a function for verifying the generated proofs
  
🔨 Tooling:
- Use Typescript for the entire challenge
- For the Polkadot-related things, we would recommend using the @polkadot/api package
- Otherwise use the tools and packages you feel comfortable with
Please complete the task as soon as possible. After submitting it back to our Head of
Operations via lourdes@t3rn.io, you will then be provided with a link to book

## 🚀 How to run the project:
1. `bun install` or whatever you want
2. `bun dev`
3. That's it 💅🏻
