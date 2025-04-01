import React, { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";

import { RootState, AppDispatch } from "../../store";
import {
  getPickupRequestById,
  updatePickupRequestStatus,
  deletePickupRequest,
} from "../../store/slices/pickupRequestSlice";

import Layout from "../../components/layout/Layout";
import PageHeader from "../../components/shared/PageHeader";
import ConfirmDialog from "../../components/shared/ConfirmDialog";

const PickupRequestDetailPage: NextPage = () => {
  const router = useRouter();
  const dispatch: AppDispatch = useDispatch();
  const { id } = router.query;

  const { pickupRequest } = useSelector(
    (state: RootState) => state.pickupRequest
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusChangeDialogOpen, setIsStatusChangeDialogOpen] =
    useState(false);
  const [pendingStatus, setPendingStatus] = useState<"PENDING" | "FINISH">(
    "PENDING"
  );

  useEffect(() => {
    if (id && typeof id === "string") {
      dispatch(getPickupRequestById(id));
    }
  }, [id, dispatch]);

  const handleUpdateStatus = async () => {
    if (id && typeof id === "string") {
      await dispatch(updatePickupRequestStatus({
        id,
        status: pendingStatus
      }));
      setIsStatusChangeDialogOpen(false);
    }
  }

  const handleDeleteRequest = async () => {
    if (id && typeof id === "string") {
      await dispatch(deletePickupRequest(id));
      router.push("/pickup");
    }
  };

  if (!pickupRequest) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <PageHeader
        title="Detail Permintaan Pengambilan"
        backLink="/pickup"
        actions={[
          {
            label: "Edit",
            onClick: () => router.push(`/pickup/${id}/edit`),
            variant: "secondary",
          },
          {
            label: "Hapus",
            onClick: () => setIsDeleteDialogOpen(true),
            variant: "danger",
          },
        ]}
      />
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Informasi Permintaan Pengambilan
          </h3>
          <div>
            <button
              onClick={() => {
                setPendingStatus(
                  pickupRequest.status === "PENDING" ? "FINISH" : "PENDING"
                );
                setIsStatusChangeDialogOpen(true);
              }}
              className={`px-4 py-2 rounded-md ${
                pickupRequest.status === "PENDING"
                  ? "bg-green-500 text-white"
                  : "bg-yellow-500 text-white"
              }`}
            >
              {pickupRequest.status === "PENDING"
                ? "Selesaikan"
                : "Kembalikan ke Pending"}
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Tanggal Permintaan
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {new Date(pickupRequest.tanggal).toLocaleDateString()}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Pengirim</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {pickupRequest.pengirim?.nama || "-"}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Telepon Pengirim
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {pickupRequest.pengirim?.telepon || "-"}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Alamat Pengambilan
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {pickupRequest.alamatPengambilan}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Tujuan</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {pickupRequest.tujuan}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Jumlah Colly
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {pickupRequest.jumlahColly}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span
                  className={`px-2 py-1 rounded-full ${
                    pickupRequest.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {pickupRequest.status === "PENDING" ? "Menunggu" : "Selesai"}
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Cabang</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {pickupRequest.cabang?.namaCabang || "-"}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Dibuat Oleh</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {pickupRequest.user?.nama || "-"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteRequest}
        title="Hapus Permintaan Pengambilan"
        content="Apakah Anda yakin ingin menghapus permintaan pengambilan ini?"
      />
      <ConfirmDialog
        open={isStatusChangeDialogOpen}
        onClose={() => setIsStatusChangeDialogOpen(false)}
        onConfirm={handleUpdateStatus}
        title="Ubah Status Permintaan Pengambilan"
        content={`Apakah Anda yakin ingin mengubah status menjadi ${
          pickupRequest.status === "PENDING" ? "Selesai" : "Pending"
        }?`}
      />
    </Layout>
  );
};

export default PickupRequestDetailPage;
