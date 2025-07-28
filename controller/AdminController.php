<?php
require_once 'models/ProductModel.php';
require_once 'models/SubCategoryModel.php';
require_once 'models/SaleModel.php';
require_once 'models/SizeModel.php';
class AdminController {
    private $productModel;

    public function __construct() {
        $this->productModel = new ProductModel();
    }

    public function index() {
        // Kiểm tra quyền admin
        if ($_SESSION['role'] !== 'admin') {
            $_SESSION['permission_required'] = "Bạn không có quyền truy cập!";
            header("Location: index.php?controller=home&action=index");
            exit;
        }

        // ==== PHÂN TRANG ====
        $perPage = 20;
        $page    = isset($_GET['page']) && is_numeric($_GET['page'])
                   ? (int)$_GET['page'] : 1;
        if ($page < 1) $page = 1;

        // Tổng sản phẩm & tổng trang
        $totalItems = $this->productModel->countAllProducts();
        $totalPages = (int)ceil($totalItems / $perPage);

        // Offset và lấy dữ liệu cho trang hiện tại
        $offset  = ($page - 1) * $perPage;
        $products = $this->productModel->getProductsByPage($perPage, $offset);
        // ====================

        include 'view/Admin.php';
    }

    public function create() {
            if ($_SESSION['role'] != 'admin') {
            // Chuyển hướng đến trang đăng nhập và thông báo
            $_SESSION['permission_required'] = "Bạn không có quyền truy cập trang này!";
            header("Location: index.php?controller=home&action=index");
            exit;
        }

        $subCategoryModel = new SubCategoryModel();
        $saleModel = new SaleModel();
        $sizeModel = new SizeModel();


        $subCategories = $subCategoryModel->getAll();
        $sales = $saleModel->getAll();

        $sizesResult = $sizeModel->getAllSizes();
        $sizes = [];
        if ($sizesResult && $sizesResult->num_rows > 0) {
        $sizes = $sizesResult->fetch_all(MYSQLI_ASSOC);
        }
        
        include 'view/createProduct.php';
    }

    public function store() {
            if ($_SESSION['role'] != 'admin') {
            // Chuyển hướng đến trang đăng nhập và thông báo
            $_SESSION['permission_required'] = "Bạn không có quyền truy cập trang này!";
            header("Location: index.php?controller=home&action=index");
            exit;
        }
        $data = [
        'name' => $_POST['name'],
        'price' => (int)$_POST['price'],
        'quantity' => (int)$_POST['quantity'],
        'detail' => $_POST['detail'],
        'imgURL_1' => $_POST['imgURL_1'],
        'imgURL_2' => $_POST['imgURL_2'],
        'imgURL_3' => $_POST['imgURL_3'],
        'imgURL_4' => $_POST['imgURL_4'],
        'subCategory_id' => (int)$_POST['subCategory_id'],
        'Sale_id' => ($_POST['Sale_id'] === "") ? null : (int)$_POST['Sale_id']
        ];

        

        $productId = $this->productModel->addProduct($data);

        $colors = $_POST['colors'] ?? [];
        $sizes = $_POST['sizes'] ?? [];
        
        

        foreach ($colors as $colorName) {
            $this->productModel->addColor($productId, $colorName);
        }

        // Thêm size
        foreach ($sizes as $sizeId) {
        if (!empty($sizeId)) {
            $this->productModel->addSize($productId, $sizeId);
        }
    }


        header("Location: index.php?controller=admin&action=index");
        exit;
    }

    public function edit() {
            if ($_SESSION['role'] != 'admin') {
            // Chuyển hướng đến trang đăng nhập và thông báo
            $_SESSION['permission_required'] = "Bạn không có quyền truy cập trang này!";
            header("Location: index.php?controller=home&action=index");
            exit;
        }
        $id = $_GET['id'];
        $product = $this->productModel->getProductByIdforUpdate($id);

        $subcategoryModel = new SubCategoryModel(); 
        $saleModel = new SaleModel();     
        $sizeModel = new SizeModel();          

        $subCategories = $subcategoryModel->getAll();
        $sales = $saleModel->getAll();
        $sizesResult = $sizeModel->getAllSizes();
        $sizes = [];
        if ($sizesResult && $sizesResult->num_rows > 0) {
        $sizes = $sizesResult->fetch_all(MYSQLI_ASSOC);
        }


        // Lấy danh sách màu sắc đã gán cho sản phẩm
        $colorsResult = $this->productModel->getColorByProductId($id);
        $colors = [];
        if ($colorsResult && $colorsResult->num_rows > 0) {
        $colors = $colorsResult->fetch_all(MYSQLI_ASSOC);
        }

        // Lấy danh sách size đã gán cho sản phẩm
        $selectedSizesResult = $this->productModel->getSizeByProductId($id);
        $selectedSizes = [];
        if($selectedSizesResult&&$selectedSizesResult->num_rows >0){
            $selectedSizes = $selectedSizesResult->fetch_all(MYSQLI_ASSOC);
        }

        include 'view/editProduct.php';
    }

    public function update() {
            if ($_SESSION['role'] != 'admin') {
            // Chuyển hướng đến trang đăng nhập và thông báo
            $_SESSION['permission_required'] = "Bạn không có quyền truy cập trang này!";
            header("Location: index.php?controller=home&action=index");
            exit;
        }
    $id = $_POST['id'];
    $data = [
        'name'            => $_POST['name'],
        'price'           => (int)$_POST['price'],
        'quantity'        => (int)$_POST['quantity'],
        'detail'          => $_POST['detail'],
        'imgURL_1'        => $_POST['imgURL_1'],
        'imgURL_2'        => $_POST['imgURL_2'],
        'imgURL_3'        => $_POST['imgURL_3'],
        'imgURL_4'        => $_POST['imgURL_4'],
        'updateAt'        => date('Y-m-d H:i:s'),
        'subCategory_id'  => (int)$_POST['subCategory_id'],
        'Sale_id' => ($_POST['Sale_id'] === "") ? null : (int)$_POST['Sale_id']

    ];

    $this->productModel->updateProduct($id, $data);

    $productModel = $this->productModel;
    $productModel->deleteColorsByProductId($id); // Xóa màu cũ
    $colors = $_POST['colors'] ?? [];
    foreach ($colors as $colorName) {
        if (!empty(trim($colorName))) {
            $productModel->addColor($id, $colorName); // Thêm lại màu mới
        }
    }

    $productModel->deleteSizesByProductId($id); // Xóa size cũ
    $sizes = $_POST['sizes'] ?? [];
    foreach ($sizes as $sizeId) {
        if (!empty($sizeId)) {
            $productModel->addSize($id, $sizeId); // Thêm lại size mới
        }
    }

    header("Location: index.php?controller=admin&action=index");
    exit;
}


    public function delete() {
            if ($_SESSION['role'] != 'admin') {
            // Chuyển hướng đến trang đăng nhập và thông báo
            $_SESSION['permission_required'] = "Bạn không có quyền truy cập trang này!";
            header("Location: index.php?controller=home&action=index");
            exit;
        }
        $id = $_GET['id'];
        $this->productModel->deleteProduct($id);
        header("Location: index.php?controller=admin&action=index");
        exit;
    }

    public function deleteMulti() {
            if ($_SESSION['role'] != 'admin') {
            // Chuyển hướng đến trang đăng nhập và thông báo
            $_SESSION['permission_required'] = "Bạn không có quyền truy cập trang này!";
            header("Location: index.php?controller=home&action=index");
            exit;
        }
    if (!empty($_POST['ids'])) {
        foreach ($_POST['ids'] as $id) {
            $this->productModel->deleteProduct($id);
        }
    }
    header("Location: index.php?controller=admin&action=index");
    exit;
    }
}