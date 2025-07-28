<?php
require_once __DIR__ . '/../models/ProductModel.php';
class AccessoriesController {
  private $productModel;

    public function __construct() {
        $this->productModel = new ProductModel();
    }

    public function index() {
        $productsArr = [];

        // Lấy tham số sort (nếu có)
        $sort = $_GET['sort'] ?? '';

        // Nếu có sub_id
        if (isset($_GET['sub_id'])) {
            $subId = intval($_GET['sub_id']);
            $productsArr = $this->productModel
                                 ->getProductsBySubCategory($subId)
                                 ->fetch_all(MYSQLI_ASSOC);
        }
        // Nếu có cat_id
        elseif (isset($_GET['cat_id'])) {
            $catId = intval($_GET['cat_id']);
            $res = $this->productModel->getProductsByCategory($catId);
            if ($res) {
                while ($row = $res->fetch_assoc()) {
                    $productsArr[] = $row;
                }
            }
        }

        // Nếu request có sort và có sản phẩm, thực hiện usort()
        if (!empty($sort) && !empty($productsArr)) {
            switch ($sort) {
                case 'price_asc':
                    usort($productsArr, function($a, $b) {
                        return $a['price'] <=> $b['price'];
                    });
                    break;

                case 'price_desc':
                    usort($productsArr, function($a, $b) {
                        return $b['price'] <=> $a['price'];
                    });
                    break;

                case 'latest':
                    usort($productsArr, function($a, $b) {
                        if (isset($a['created_at'], $b['created_at'])) {
                            return strtotime($b['created_at']) <=> strtotime($a['created_at']);
                        }
                        // Nếu không có created_at, fallback sort theo id giảm dần
                        return intval($b['id']) <=> intval($a['id']);
                    });
                    break;

                default:
                    // Giá trị sort không khớp, giữ nguyên
                    break;
            }
        }
           $limit = 32;
        $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
        $total = count($productsArr);
        $totalPages = ceil($total / $limit);
        $offset = ($page - 1) * $limit;

        $productsArr = array_slice($productsArr, $offset, $limit);


        include __DIR__ . '/../view/Accessories.php';
    }
}