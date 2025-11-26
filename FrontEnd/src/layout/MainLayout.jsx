import Nav from "../components/Nav/Nav"
import Sidebar from "../components/Sidebar/Sidebar"
import Contents from "../components/Contents/Contents"
const MainLayout = () => {
  return (
    <section id="main-layout">
        <Nav></Nav>
        <Contents></Contents>
        <Sidebar></Sidebar>
    </section>
  )
}

export default MainLayout