"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Bold, Italic } from "lucide-react"
import { useEffect } from "react"

interface Props {
    value: string
    onChange: (value: string) => void
}

export function RichTextEditor({ value, onChange }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
                bulletList: false,
                orderedList: false,
                listItem: false,
                codeBlock: false,
                blockquote: false,
                horizontalRule: false,
                hardBreak: false,
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: "editor-content",
            },
        },
        injectCSS: false,
        immediatelyRender: false,
    })

    // Sync editor content if value changes externally
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value, { emitUpdate: false })
        }
    }, [value, editor])

    if (!editor) return null

    return (
        <div className="border rounded-md p-2">
            <ToggleGroup type="multiple" className="mb-2 justify-start">
                <ToggleGroupItem
                    value="bold"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    data-state={editor.isActive("bold") ? "on" : "off"}
                >
                    <Bold className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="italic"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    data-state={editor.isActive("italic") ? "on" : "off"}
                >
                    <Italic className="w-4 h-4" />
                </ToggleGroupItem>
            </ToggleGroup>

            <EditorContent editor={editor} />
        </div>
    )
}
