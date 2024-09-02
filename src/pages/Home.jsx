import './home.css';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <div className="h-screen flex">
        <div className="flex-1 flex justify-center items-center backLogo">
          <div className="">
            CASS
          </div>
        </div>

        <div className="flex-1 flex justify-center items-center flex-col">
          lol play

          <div>
            insert QR codes for whatever
          </div>

          <Link to="/Jeopardy">
            <button>hi</button>
          </Link>
        </div>
      </div>
    </>
  );
}
