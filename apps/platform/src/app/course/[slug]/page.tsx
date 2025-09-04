export default function CourseLandingPage({
  params: { slug },
}: {
  params: { slug: string };
}): React.JSX.Element {
  return <div>Course landing page for slug: {slug}</div>;
}
