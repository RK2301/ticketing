import 'bootstrap/dist/css/bootstrap.css'
import buildClient from "../api/build-client";
import Header from '../components/header';
import '../styles/globals.css'
import Head from 'next/head'

const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
        <div>
            <Head>
                <title>Ticketing</title>
                <link rel="icon" href="/ticketingLogo.png" />
            </Head>
            <Header currentUser={currentUser} />
            <Component currentUser={currentUser} {...pageProps} />
        </div>

    )
}

AppComponent.getInitialProps = async (appContext) => {
    const client = buildClient(appContext.ctx)
    const { data } = await client.get('/api/users/currentuser')

    //execute getInitialProps for the comp to be rendered if has this func defined
    let pageProps = {}
    if (appContext.Component.getInitialProps)
        pageProps = await appContext.Component.getInitialProps(appContext.ctx, client, data.currentUser)


    return {
        pageProps,
        ...data
    }
}


export default AppComponent