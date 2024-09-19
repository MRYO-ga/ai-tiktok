const React = window.React;

const MarkdownRenderer = ({ content }) => {
  const [htmlContent, setHtmlContent] = React.useState('');

  React.useEffect(() => {
    const converter = new showdown.Converter();
    const html = converter.makeHtml(content);
    setHtmlContent(html);
  }, [content]);

  return React.createElement('div', {
    dangerouslySetInnerHTML: { __html: htmlContent },
    className: 'markdown-content'
  });
};

window.MarkdownRenderer = MarkdownRenderer;