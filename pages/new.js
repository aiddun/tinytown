import Head from "next/head";

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

function NewTown() {
  return (
    <>
      <Head>
        <meta key="robots" name="robots" content="noindex, follow" />
        <meta key="googlebot" name="googlebot" content="noindex, follow" />
      </Head>
      <p>constructing town</p>
    </>
  );
}

export default NewTown;
