import Document, { Html, Head, Main, NextScript } from 'next/document'


class MyDocument extends Document {
	  static async getInitialProps(ctx) {
		      const initialProps = await Document.getInitialProps(ctx)
		      return { ...initialProps }
		    }


	  render() {
		      return (
	<Html>
	
	<Head>
			      <script async src="https://www.googletagmanager.com/gtag/js?id=G-W62MTNNLB0"></script>
	  <script dangerouslySetInnerHTML={{__html: `
	    window.dataLayer = window.dataLayer || [];
	      function gtag(){dataLayer.push(arguments);}
	        gtag('js', new Date());

		  gtag('config', 'G-W62MTNNLB0');
		  `}} />
	
<title>tiny town</title>
<meta name="title" content="tiny town"/>
<meta name="description" content="Walk around and chat with positional audio, like in real life"/>

<meta property="og:type" content="website"/>
<meta property="og:title" content="tiny town"/>
<meta property="og:description" content="Walk around and chat with positional audio, like in real life"/>
<meta property="og:image" content="https://tinytown.to/img/ttmeta.jpg"/>

<meta property="twitter:card" content="summary_large_image"/>
<meta property="twitter:title" content="tiny town"/>
<meta property="twitter:description" content="Walk around and chat with positional audio, like in real life"/>
<meta property="twitter:image" content="https://tinytown.to/img/ttmeta.jpg"/>	

   <link rel="apple-touch-icon" sizes="180x180" href="/meta/icons/apple-touch-icon.png"/>
			      <link rel="icon" type="image/png" sizes="32x32" href="/meta/icons/favicon-32x32.png"/>
			      <link rel="icon" type="image/png" sizes="16x16" href="/meta/icons/favicon-16x16.png"/>
			      <link rel="manifest" href="/meta/icons/site.webmanifest"/>
			      <link rel="mask-icon" href="/meta/icons/safari-pinned-tab.svg" color="#3b76ee"/>
			      <link rel="shortcut icon" href="/meta/icons/favicon.ico"/>
			      <meta name="msapplication-TileColor" content="#3b76ee"/>
			      <meta name="msapplication-config" content="/meta/icons/browserconfig.xml"/>
			      <meta name="theme-color" content="#ffffff"/>
	 </Head> <body>  <Main />
	    <NextScript />
	</body> </Html>
		      )}} export default MyDocument
