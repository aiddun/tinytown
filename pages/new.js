import Head from "next/head";

export async function getServerSideProps(context) {
  try {
    const res = await fetch(`http://localhost:8888/newtown`);
    const data = await res.json();
    const { roomId } = data;

    return {
      redirect: {
        destination: `/${roomId || ""}`,
        permanent: false,
      },
    };
  } catch {
    return {props: {}};
  }
}

function NewTown() {
  return (
    <>
      <Head>
        <meta key="robots" name="robots" content="noindex, nofollow" />
        <meta key="googlebot" name="googlebot" content="noindex, nofollow" />
      </Head>
      <p>constructing town</p>
    </>
  );
}

export default NewTown;
