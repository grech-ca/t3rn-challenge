export const Note = () => {
  return (
    <p className="max-w-screen-sm p-4 text-sm bg-white rounded-lg shadow-xl shadow-black/5" >
      I hope I got the challenge idea right. But anyways, here is the note so you understand what happens here:

      <ul className="[&>li>b]:font-bold [&>li]:after:[content:';'] [&>li:last-child]:after:[content:''] list-disc list-inside">
        <li>I set the <b>BATCH_LIMIT</b> to <b>15</b> for demonstration purposes</li>
        <li>I decided not to virtualize the list</li>
        <li>
          Since the proof cannot be generated before the merkle tree is created,
          there's a loading indicator in the top right corner of each block header card.
          When the merkle tree is created for a batch of headers, these headers will get
          validated and you will see either "✅" or "❌" depending on the proof verification result.
        </li>
      </ul>
    </p>
  )
}
