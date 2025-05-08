import {AxiosClient} from '@/utils/axios';

const axiosClient = new AxiosClient();

// Interfaces for the product data structure
export interface ProductImage {
	type: string;
	id: number;
	attributes: {
		image: string;
	};
}

export interface ProductReview {
	type: string;
	id: number;
	attributes: {
		rating: number;
		comment: string;
		created_at: string;
	};
	product?: Product;
}

export interface Product {
	type: string;
	id: number;
	attributes: {
		name: string;
		slug: string;
		description: string;
		price: number;
		category: string[];
		stock_quantity: number;
		unit: string;
		measurement: string;
		thumbnail: string;
		status: 'active' | 'inactive';
		created_at: string;
	};
	images: ProductImage[];
	reviews: ProductReview[];
}

export interface ProductsResponse {
	status: number;
	message: string;
	data: {
		products: Product[];
	};
}

export interface ProductDetailsResponse {
	status: number;
	message: string;
	data: {
		product: Product;
	};
}

/**
 * Fetches all products for the seller
 * @returns Promise with seller's products data
 */
export const getSellerProducts = async () => {
	const response = await axiosClient.get<ProductsResponse>(
		'/sellers/product?include=images,reviews'
	);
	return response.data;
};

/**
 * Fetches a single product by ID
 * @param id - Product ID
 * @returns Promise with product data
 */
export const getSellerProductById = async (id: number | string) => {
	const response = await axiosClient.get<ProductDetailsResponse>(
		`/sellers/product/${id}?include=images,reviews`
	);
	return response.data;
};

/**
 * Creates a new product
 * @param productData - Form data containing product details
 * @returns Promise with created product data
 */
export const createProduct = async (productData: FormData) => {
	const response = await axiosClient.post('/sellers/product', productData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return response.data;
};

/**
 * Updates an existing product
 * @param id - Product ID
 * @param productData - Form data containing updated product details
 * @returns Promise with updated product data
 */
export const updateProduct = async (
	id: number | string,
	productData: FormData
) => {
	const response = await axiosClient.post(
		`/sellers/product/${id}`,
		productData,
		{
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		}
	);
	return response.data;
};

/**
 * Deletes a product
 * @param id - Product ID
 * @returns Promise with deletion status
 */
export const deleteProduct = async (id: number | string) => {
	const response = await axiosClient.delete(`/sellers/product/${id}`);
	return response.data;
};

/**
 * Updates product status (active/inactive)
 * @param id - Product ID
 * @param status - New status: 'active' or 'inactive'
 * @returns Promise with updated product data
 */
export const updateProductStatus = async (
	id: number | string,
	status: 'active' | 'inactive'
) => {
	const response = await axiosClient.patch(`/sellers/products/${id}/status`, {
		status,
	});
	return response.data;
};
