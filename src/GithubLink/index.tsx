import {FaGithub} from 'react-icons/fa';

export const GithubLink = () => {
  return (
    <a href="https://github.com/grech-ca/t3rn-challenge" target="_blank" className="absolute right-6 top-6 flex text-lg items-center gap-x-2 opacity-50 transition-opacity hover:opacity-100">
      <FaGithub className="text-xl" />
      <span className="font-medium">grech-ca/t3rn-challenge</span>
    </a>
  )
}
