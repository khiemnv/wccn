import { useState } from 'react';
import {
    Box, Typography, Table, TableHead, TableBody, TableRow, TableCell,
    Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RestoreIcon from '@mui/icons-material/Restore';

import "react-diff-view/style/index.css";
import { diff_match_patch } from 'diff-match-patch';
import { Diff, Hunk, parseDiff } from 'react-diff-view';
import { createUnifiedDiff } from '../utils/fbUtil';

// const editHistories = [
//   { version: 'v5', time: '2025-12-03 10:21', editor: 'Nguyễn Văn A', note: 'Sửa tiêu đề', content: 'Tiêu đề mới\nNội dung A\nKết luận' },
//   { version: 'v4', time: '2025-12-01 09:15', editor: 'Trần Thị B', note: 'Thêm hình ảnh', content: 'Tiêu đề cũ\nNội dung A\nKết luận' },
//   { version: 'v3', time: '2025-11-30 14:03', editor: 'Lê Văn C', note: 'Xóa đoạn văn', content: 'Tiêu đề cũ\nNội dung cũ\nKết luận' },
// ];

export function DiffView({ oldText, newText }) {
    // console.log([oldText, newText]);
    var patch = createUnifiedDiff(oldText, newText);
    // console.log(patch)
    const files = parseDiff(patch);
    function renderFile({ oldRevision, newRevision, type, hunks }) {
        return (
            <Diff key={oldRevision + '-' + newRevision} viewType="split" diffType={type} hunks={hunks}>
                {hunks => hunks.map(hunk => <Hunk key={hunk.content} hunk={hunk} />)}
            </Diff>
        );
    }
    return (
        <div>
            {files.map(renderFile)}
        </div>
    );

}

function EditHistoryScreen({ editHistories }) {
    //   const [compareOpen, setCompareOpen] = useState(false);
    const [revertOpen, setRevertOpen] = useState(false);
    const [selectedVer, setSelectedVer] = useState(null);
    //   const [diffView, setDiffView] = useState();

    const handleCompare = (index) => {
        if (index < (editHistories.length - 1)) {
            setSelectedVer(index);
            // setDiffView([editHistories[index-1].content, editHistories[index].content])
            // setCompareOpen(true);
        }
    };

    const handleRevert = (index) => {
        setSelectedVer(index);
        setRevertOpen(true);
    };
    const compareOpen = !!selectedVer;
    //   const diffView = [editHistories[selectedVer-1].content, editHistories[selectedVer].content];
    // console.log(compareOpen, diffView);
    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>Lịch Sử Chỉnh Sửa</Typography>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Phiên bản</TableCell>
                        <TableCell>Thời gian</TableCell>
                        <TableCell>Người chỉnh sửa</TableCell>
                        <TableCell>Ghi chú</TableCell>
                        <TableCell align="center">Hành động</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {editHistories.map((row, idx) => (
                        <TableRow key={row.version}>
                            <TableCell>{row.version}</TableCell>
                            <TableCell>{row.time}</TableCell>
                            <TableCell>{row.editor}</TableCell>
                            <TableCell>{row.note}</TableCell>
                            <TableCell align="center">
                                <Button
                                    variant="outlined"
                                    startIcon={<CompareArrowsIcon />}
                                    onClick={() => handleCompare(idx)}
                                    disabled={idx === editHistories.length - 1}
                                    sx={{ mr: 1 }}
                                >
                                    So sánh
                                </Button>

                                <Button
                                    variant="contained"
                                    color="warning"
                                    startIcon={<RestoreIcon />}
                                    onClick={() => handleRevert(idx)}
                                >
                                    Khôi phục
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {compareOpen && <Dialog open={compareOpen} onClose={() => setSelectedVer(null)} maxWidth="md" fullWidth>
                <DialogTitle>So sánh phiên bản</DialogTitle>
                <DialogContent>
                    <DiffView oldText={editHistories[selectedVer - 1].content} newText={editHistories[selectedVer].content} >

                    </DiffView>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSelectedVer(null)}>Đóng</Button>
                </DialogActions>
            </Dialog>}

            <Dialog open={revertOpen} onClose={() => setRevertOpen(false)}>
                <DialogTitle>Xác nhận khôi phục</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có muốn khôi phục phiên bản {editHistories[selectedVer]?.version}?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRevertOpen(false)}>Hủy</Button>
                    <Button
                        color="warning"
                        onClick={() => {
                            alert(`Đã khôi phục về ${editHistories[selectedVer].version}`);
                            setRevertOpen(false);
                        }}
                    >
                        Đồng ý
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default EditHistoryScreen;
