import ReactMarkdown from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import "./markdown.scss";

export const Markdown: React.FC<{ contents: string }> = ({ contents }) => {
  return (
    <div className="markdown-section">
      <div className="inner-contents">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkToc]}
          rehypePlugins={[rehypeSlug]}
        >
          {contents}
        </ReactMarkdown>
      </div>
    </div>
  );
};
