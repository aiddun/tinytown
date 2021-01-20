// import { useRouter } from "next/router";

export async function getServerSideProps(context) {
  const res = await fetch(`http://localhost:8888/newtown`);
  const data = await res.json();
  const { roomId } = data;

  return {
    redirect: {
      destination: `/${roomId || ""}`,
      permanent: false,
    },
  };
}

function NewTown({ children, href }) {
  // const router = useRouter();

  // router.push(href);

  return <p>constructing town</p>;
}

export default NewTown;
