import React from "react";
import type { ModalProps } from "@mantine/core";
import { Modal, Stack, Text, ScrollArea, Flex, CloseButton, Button, Textarea, Group } from "@mantine/core";
import { CodeHighlight } from "@mantine/code-highlight";
import type { NodeData } from "../../../types/graph";
import useGraph from "../../editor/views/GraphView/stores/useGraph";
import useJson from "../../../store/useJson";

// return object from json removing array and object fields
const normalizeNodeData = (nodeRows: NodeData["text"]) => {
  if (!nodeRows || nodeRows.length === 0) return "{}";
  if (nodeRows.length === 1 && !nodeRows[0].key) return `${nodeRows[0].value}`;

  const obj = {};
  nodeRows?.forEach(row => {
    if (row.type !== "array" && row.type !== "object") {
      if (row.key) obj[row.key] = row.value;
    }
  });
  return JSON.stringify(obj, null, 2);
};

// return json path in the format $["customer"]
const jsonPathToString = (path?: NodeData["path"]) => {
  if (!path || path.length === 0) return "$";
  const segments = path.map(seg => (typeof seg === "number" ? seg : `"${seg}"`));
  return `$[${segments.join("][")}]`;
};

export const NodeModal = ({ opened, onClose }: ModalProps) => {
  const nodeData = useGraph(state => state.selectedNode);
  const getJson = useJson(state => state.getJson);
  const setJson = useJson(state => state.setJson);

  const [editing, setEditing] = React.useState(false);
  const [editText, setEditText] = React.useState("");

  React.useEffect(() => {
    setEditing(false);
    setEditText(normalizeNodeData(nodeData?.text ?? []));
  }, [nodeData, opened]);

  // helper to set value at json path
  const setValueAtPath = (root: any, path: Array<string | number> | undefined, value: any) => {
    if (!path || path.length === 0) {
      // replace whole document
      return value;
    }

    const cloned = root;
    let cur: any = cloned;
    for (let i = 0; i < path.length - 1; i++) {
      const seg = path[i];
      if (typeof seg === "number") {
        cur = cur[seg];
      } else {
        cur = cur[seg];
      }
    }
    const last = path[path.length - 1];
    if (typeof last === "number") {
      cur[last] = value;
    } else {
      cur[last] = value;
    }
    return cloned;
  };

  const handleSave = () => {
    try {
      const current = JSON.parse(getJson());
      const parsed = JSON.parse(editText);
      const newRoot = setValueAtPath(current, nodeData?.path, parsed);
      setJson(JSON.stringify(newRoot, null, 2));
      setEditing(false);
      onClose?.();
    } catch (e) {
      // simple feedback for invalid JSON
      // Keep editing mode open so user can fix
      // eslint-disable-next-line no-alert
      alert("Invalid JSON: " + (e as Error).message);
    }
  };

  const handleCancel = () => {
    setEditText(normalizeNodeData(nodeData?.text ?? []));
    setEditing(false);
  };

  return (
    <Modal size="auto" opened={opened} onClose={onClose} centered withCloseButton={false}>
      <Stack pb="sm" gap="sm">
        <Stack gap="xs">
          <Flex justify="space-between" align="center">
            <Text fz="xs" fw={500}>
              Content
            </Text>
            <Group spacing="xs">
              {!editing && (
                <Button size="xs" variant="outline" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              )}
              {editing && (
                <>
                  <Button size="xs" color="green" onClick={handleSave}>
                    Save
                  </Button>
                  <Button size="xs" color="gray" variant="subtle" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              )}
              <CloseButton onClick={onClose} />
            </Group>
          </Flex>
          <ScrollArea.Autosize mah={250} maw={600}>
            {!editing ? (
              <CodeHighlight
                code={normalizeNodeData(nodeData?.text ?? [])}
                miw={350}
                maw={600}
                language="json"
                withCopyButton
              />
            ) : (
              <Textarea
                minRows={6}
                value={editText}
                onChange={e => setEditText(e.currentTarget.value)}
                maw={600}
              />
            )}
          </ScrollArea.Autosize>
        </Stack>
        <Text fz="xs" fw={500}>
          JSON Path
        </Text>
        <ScrollArea.Autosize maw={600}>
          <CodeHighlight
            code={jsonPathToString(nodeData?.path)}
            miw={350}
            mah={250}
            language="json"
            copyLabel="Copy to clipboard"
            copiedLabel="Copied to clipboard"
            withCopyButton
          />
        </ScrollArea.Autosize>
      </Stack>
    </Modal>
  );
};
