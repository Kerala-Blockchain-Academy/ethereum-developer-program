package main

import (
	"context"
	"math/big"
	"testing"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi/bind/v2"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient/simulated"
	"github.com/ethereum/go-ethereum/params"
	"github.com/stretchr/testify/assert"
)

func simulateBackend() (*simulated.Backend, []*bind.TransactOpts, error) {
	k1, err := crypto.GenerateKey()
	if err != nil {
		return nil, nil, err
	}
	k2, err := crypto.GenerateKey()
	if err != nil {
		return nil, nil, err
	}

	chainID := params.AllDevChainProtocolChanges.ChainID
	t1 := bind.NewKeyedTransactor(k1, chainID)
	t2 := bind.NewKeyedTransactor(k2, chainID)

	sim := simulated.NewBackend(map[common.Address]types.Account{
		t1.From: {Balance: big.NewInt(9e18)},
		t2.From: {Balance: big.NewInt(9e18)},
	})

	return sim, []*bind.TransactOpts{t1, t2}, nil
}

func TestDeploy(t *testing.T) {
	sim, auth, err := simulateBackend()
	if err != nil {
		t.Fatalf("Failed to create simulated backend: %v", err)
	}

	contractAddress := crypto.CreateAddress(auth[0].From, 0)

	deployedContract, tx, err := bind.DeployContract(auth[0], common.FromHex(CertMetaData.Bin), sim.Client(), nil)
	if err != nil {
		t.Fatalf("Failed to deploy smart contract: %v", err)
	}
	assert.NotNil(t, tx)

	sim.Commit()

	assert.Equal(t, contractAddress, deployedContract)
}

func TestIssue(t *testing.T) {
	sim, auth, err := simulateBackend()
	if err != nil {
		t.Fatalf("Failed to create simulated backend: %v", err)
	}

	deployedContract, tx, err := bind.DeployContract(auth[0], common.FromHex(CertMetaData.Bin), sim.Client(), nil)
	if err != nil {
		t.Fatalf("Failed to deploy smart contract: %v", err)
	}
	assert.NotNil(t, tx)

	sim.Commit()

	cert := NewCert()
	instance := cert.Instance(sim.Client(), deployedContract)

	id := big.NewInt(14)
	ct := CertificatesOutput{
		Name:   "Deren",
		Course: "MBCC",
		Grade:  "S",
		Date:   "27-06-2025",
	}

	tx, err = bind.Transact(instance, auth[0], cert.PackIssue(id, ct.Name, ct.Course, ct.Grade, ct.Date))
	if err != nil {
		t.Fatalf("Failed to issue certificate: %v", err)
	}
	assert.NotNil(t, tx)

	sim.Commit()

	logs, err := sim.Client().FilterLogs(context.Background(), ethereum.FilterQuery{
		Addresses: []common.Address{deployedContract},
	})
	if err != nil {
		t.Fatalf("Failed to filter logs: %v", err)
	}
	assert.NotEmpty(t, logs)

	event, err := cert.UnpackIssuedEvent(&logs[0])
	if err != nil {
		t.Fatalf("Failed to unpack 'Issued' event: %v", err)
	}

	assert.Equal(t, crypto.Keccak256Hash([]byte(ct.Course)), logs[0].Topics[1])
	assert.Equal(t, crypto.Keccak256Hash([]byte(ct.Course)), event.Course)
	assert.Equal(t, id, event.Id)
	assert.Equal(t, ct.Grade, event.Grade)
}

func TestCertificates(t *testing.T) {
	sim, auth, err := simulateBackend()
	if err != nil {
		t.Fatalf("Failed to create simulated backend: %v", err)
	}

	deployedContract, tx, err := bind.DeployContract(auth[0], common.FromHex(CertMetaData.Bin), sim.Client(), nil)
	if err != nil {
		t.Fatalf("Failed to deploy smart contract: %v", err)
	}
	assert.NotNil(t, tx)

	sim.Commit()

	cert := NewCert()
	instance := cert.Instance(sim.Client(), deployedContract)

	id := big.NewInt(885)
	ct := CertificatesOutput{
		Name:   "Shawn",
		Course: "MBCC",
		Grade:  "A",
		Date:   "27-06-2025",
	}

	tx, err = bind.Transact(instance, auth[0], cert.PackIssue(id, ct.Name, ct.Course, ct.Grade, ct.Date))
	if err != nil {
		t.Fatalf("Failed to issue certificate: %v", err)
	}
	assert.NotNil(t, tx)

	sim.Commit()

	out, err := bind.Call(instance, nil, cert.PackCertificates(id), cert.UnpackCertificates)
	if err != nil {
		t.Fatalf("Failed to call Certificates method: %v", err)
	}

	if assert.NotNil(t, out) {
		assert.EqualValues(t, ct, out)
	}
}

func TestModifier(t *testing.T) {
	sim, auth, err := simulateBackend()
	if err != nil {
		t.Fatalf("Failed to create simulated backend: %v", err)
	}

	deployedContract, tx, err := bind.DeployContract(auth[0], common.FromHex(CertMetaData.Bin), sim.Client(), nil)
	if err != nil {
		t.Fatalf("Failed to deploy smart contract: %v", err)
	}
	assert.NotNil(t, tx)

	sim.Commit()

	cert := NewCert()
	instance := cert.Instance(sim.Client(), deployedContract)

	id := big.NewInt(270)
	ct := CertificatesOutput{
		Name:   "Che",
		Course: "MBCC",
		Grade:  "B",
		Date:   "27-06-2025",
	}

	_, err = bind.Transact(instance, auth[1], cert.PackIssue(id, ct.Name, ct.Course, ct.Grade, ct.Date))
	assert.NotNil(t, err)
	assert.ErrorContains(t, err, "Access Denied")
}
