<?php
// File: controller/BaseController.php
require_once __DIR__ . '/../models/CategoryModel.php';

class BaseController {
    protected $categoryModel;

    public function __construct() {
        $this->categoryModel = new CategoryModel();
        $this->buildCategoriesTree();
    }

    private function buildCategoriesTree() {
        $parentResult = $this->categoryModel->getAllCategories();
        $categoriesTree = [];

        if ($parentResult) {
            while ($parent = $parentResult->fetch_assoc()) {
                $subCategories = [];
                $subResult = $this->categoryModel->getSubCategoriesByCategoryId($parent['id']);
                if ($subResult) {
                    while ($sub = $subResult->fetch_assoc()) {
                        $subCategories[] = [
                            'id'      => $sub['id'],
                            'name'    => $sub['name'],
                           
                        ];
                    }
                }

                $categoriesTree[] = [
                    'id'            => $parent['id'],
                    'name'          => $parent['name'],
                    'subcategories' => $subCategories
                ];
            }
        }

        // Luôn gán biến global thành mảng (có thể rỗng)
        $GLOBALS['global_categories_tree'] = $categoriesTree;
    }
}