import Loading from "../assets/loader.svg"

function Loader() {
  return (
    <div className='flex justify-center items-center w-screen h-screen'>
    <img src={Loading} alt="Loading" className="w-20 h-20" />
  </div>
  );
}

export default Loader;