import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { InstagramIcon } from 'lucide-react';
import { useState, useRef, type RefObject } from 'react';

const TiptapEditor = ({ content, setContent }: { content: string, setContent: (content: string) => void }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    HTMLAttributes: {
                        class: 'list-disc ml-4'
                    }
                },
            }),
            Placeholder.configure({
                placeholder: 'Nội dung problem',
                emptyNodeClass:
                    'first:before:text-gray-400 first:before:float-lef first:before:h-0 t first:before:content-[attr(data-placeholder)] first:before:pointer-events-none',
            }),
        ],
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[350px]',
            },
        },
        content: content,
        editable: true,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML());
        },
    })

    if (!editor) return null;

    return (
        <div className="prose prose-sm max-w-none [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mb-4 [&>h3]:font-medium [&>h3]:mt-6 [&>h3]:mb-2 [&>p]:text-gray-600 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-2 [&>ul>li]:text-gray-600 text-xl">
            <EditorContent editor={editor} placeholder='Bạn muốn chia sẻ điều gì?' />
        </div>
    );
};

export default TiptapEditor; 