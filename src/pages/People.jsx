import RawHtmlPage from "../components/RawHtmlPage";
import html from "../templates/people.body.html?raw";

export default function People() {
  return <RawHtmlPage html={html} />;
}
