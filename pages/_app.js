// import { UserContextProvider } from '../components/UserContext'
import "tailwindcss/tailwind.css";
import "../global.css"
import "react-awesome-button/src/styles/styles.scss";

export default function MyApp({ Component, pageProps }) {
  return (
    // <UserContextProvider>
	  <Component {...pageProps} />
    // </UserContextProvider>
  )
}
