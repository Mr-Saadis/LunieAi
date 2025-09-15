
// src/app/api/widget/embed/[chatbotId]/route.js
import { NextResponse } from 'next/server'

/**
 * Generate embed code for chatbot widget
 */
export async function GET(request, { params }) {
  try {
    const { chatbotId } = await params
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain') || 'your-domain.com'

    // Generate JavaScript embed code
    const embedCode = generateEmbedCode(chatbotId, domain)

    return NextResponse.json({
      chatbotId,
      embedCode,
      instructions: {
        html: 'Copy and paste this code before the closing </body> tag on your website',
        wordpress: 'Add this code to your WordPress site using a Custom HTML widget or theme customizer',
        iframe: `<iframe src="${process.env.NEXT_PUBLIC_APP_URL}/widget/${chatbotId}" width="400" height="500" frameborder="0"></iframe>`
      }
    })
  } catch (error) {
    console.error('Embed code generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate embed code' },
      { status: 500 }
    )
  }
}

function generateEmbedCode(chatbotId, domain) {
  return `<!-- Lunie-Ai Chat Widget -->
<script>
  (function() {
    // Widget configuration
    window.LunieAiConfig = {
      chatbotId: '${chatbotId}',
      domain: '${domain}',
      apiUrl: '${process.env.NEXT_PUBLIC_APP_URL}'
    };

    // Load widget script
    var script = document.createElement('script');
    script.src = '${process.env.NEXT_PUBLIC_APP_URL}/widget.js';
    script.async = true;
    script.onload = function() {
      if (window.LunieAiWidget) {
        window.LunieAiWidget.init(window.LunieAiConfig);
      }
    };
    document.head.appendChild(script);

    // Load widget styles
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '${process.env.NEXT_PUBLIC_APP_URL}/widget.css';
    document.head.appendChild(link);
  })();
</script>
<!-- End Lunie-Ai Chat Widget -->`
}


