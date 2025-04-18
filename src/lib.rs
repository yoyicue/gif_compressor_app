let output_path_clone = output_path.clone(); // 在移动前先克隆一份
let result = tokio::task::spawn_blocking(move || {
    // ... existing code ...
        output_path_clone,
    // ... existing code ...
});
output_path: output_path.clone(), 